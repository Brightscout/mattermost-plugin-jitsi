// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License for license information.

package main

import (
	"fmt"
	"net/url"
	"reflect"

	"github.com/mattermost/mattermost-plugin-api/experimental/telemetry"
	"github.com/mattermost/mattermost-server/v5/mlog"
	"github.com/mattermost/mattermost-server/v5/model"
	"github.com/pkg/errors"
)

// configuration captures the plugin's external configuration as exposed in the Mattermost server
// configuration, as well as values computed from the configuration. Any public fields will be
// deserialized from the Mattermost server configuration in OnConfigurationChange.
//
// As plugins are inherently concurrent (hooks being called asynchronously), and the plugin
// configuration can change at any time, access to the configuration must be synchronized. The
// strategy used in this plugin is to guard a pointer to the configuration, and clone the entire
// struct whenever it changes. You may replace this with whatever strategy you choose.
//
// If you add non-reference types to your configuration struct, be sure to rewrite Clone as a deep
// copy appropriate for your types.
type configuration struct {
	JitsiSettings jitsisettings
}

type jitsisettings struct {
	JitsiURL               string
	JitsiAppID             string
	JitsiAppSecret         string
	JitsiNamingScheme      string
	JaaSAppID              string
	JaaSApiKey             string
	JaaSPrivateKey         string
	JitsiLinkValidTime     int
	JitsiJWT               bool
	JitsiEmbedded          bool
	JitsiCompatibilityMode bool
	UseJaaS                bool
}

const publicJitsiServerURL = "https://meet.jit.si"
const public8x8vcURL = "https://8x8.vc"

// GetJitsiURL return the currently configured JitsiURL or the URL from the
// public servers provided by Jitsi.
func (j *jitsisettings) GetJitsiURL() string {
	if len(j.JitsiURL) > 0 {
		return j.JitsiURL
	}
	return publicJitsiServerURL
}

func (j *jitsisettings) GetDefaultJitsiURL() string {
	return publicJitsiServerURL
}

func (j *jitsisettings) Get8x8vcURL() string {
	return public8x8vcURL
}

// Clone shallow copies the configuration. Your implementation may require a deep copy if
// your configuration has reference types.
func (c *configuration) Clone() *configuration {
	var clone = *c
	return &clone
}

// IsValid checks if all needed fields are set.
func (j *jitsisettings) IsValid() error {
	if len(j.JitsiURL) > 0 {
		_, err := url.Parse(j.JitsiURL)
		if err != nil {
			return fmt.Errorf("error invalid jitsiURL")
		}
	}

	if j.JitsiJWT {
		if len(j.JitsiAppID) == 0 {
			return fmt.Errorf("error no Jitsi app ID was provided to use with JWT")
		}
		if len(j.JitsiAppSecret) == 0 {
			return fmt.Errorf("error no Jitsi app secret provided to use with JWT")
		}
		if j.JitsiLinkValidTime < 1 {
			j.JitsiLinkValidTime = 30
		}
	}

	if j.UseJaaS {
		if len(j.JaaSApiKey) == 0 {
			mlog.Error("error no JaaS Api Key was provided for JaaS")
		}

		if len(j.JaaSAppID) == 0 {
			mlog.Error("error no JaaS AppID was provided for JaaS")
		}

		if len(j.JaaSPrivateKey) == 0 {
			mlog.Error("error no JaaS Private Key was provided for JaaS")
		}
	}

	return nil
}

// getConfiguration retrieves the active configuration under lock, making it safe to use
// concurrently. The active configuration may change underneath the client of this method, but
// the struct returned by this API call is considered immutable.
func (p *Plugin) getConfiguration() *jitsisettings {
	p.configurationLock.RLock()
	defer p.configurationLock.RUnlock()

	if p.configuration == nil {
		newConfiguration := configuration{}
		return &newConfiguration.JitsiSettings
	}

	return &p.configuration.JitsiSettings
}

// setConfiguration replaces the active configuration under lock.
//
// Do not call setConfiguration while holding the configurationLock, as sync.Mutex is not
// reentrant. In particular, avoid using the plugin API entirely, as this may in turn trigger a
// hook back into the plugin. If that hook attempts to acquire this lock, a deadlock may occur.
//
// This method panics if setConfiguration is called with the existing configuration. This almost
// certainly means that the configuration was modified without being cloned and may result in
// an unsafe access.
func (p *Plugin) setConfiguration(configuration *configuration) {
	p.configurationLock.Lock()
	defer p.configurationLock.Unlock()

	if configuration != nil && p.configuration == configuration {
		// Ignore assignment if the configuration struct is empty. Go will optimize the
		// allocation for same to point at the same memory address, breaking the check
		// above.
		if reflect.ValueOf(*configuration).NumField() == 0 {
			return
		}

		panic("setConfiguration called with the existing configuration")
	}

	p.API.PublishWebSocketEvent(configChangeEvent, nil, &model.WebsocketBroadcast{})
	p.configuration = configuration
}

// OnConfigurationChange is invoked when configuration changes may have been made.
func (p *Plugin) OnConfigurationChange() error {
	var configuration = new(configuration)
	// Load the public configuration fields from the Mattermost server configuration.
	if err := p.API.LoadPluginConfiguration(configuration); err != nil {
		return errors.Wrap(err, "failed to load plugin configuration")
	}

	enableDiagnostics := false
	if config := p.API.GetConfig(); config != nil {
		if configValue := config.LogSettings.EnableDiagnostics; configValue != nil {
			enableDiagnostics = *configValue
		}
	}

	p.tracker = telemetry.NewTracker(p.telemetryClient, p.API.GetDiagnosticId(), p.API.GetServerVersion(), manifest.Id, manifest.Version, "jitsi", enableDiagnostics)

	p.setConfiguration(configuration)
	return nil
}

// OnDeactivate is invoked once the user disables the plugin
func (p *Plugin) OnDeactivate() error {
	if p.telemetryClient != nil {
		err := p.telemetryClient.Close()
		if err != nil {
			p.API.LogWarn("OnDeactivate: failed to close telemetryClient", "error", err.Error())
		}
	}

	return nil
}
