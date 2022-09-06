import React, {useEffect, useState, ChangeEvent} from 'react';
import {FormattedMessage} from 'react-intl';
import {AdminConfig} from 'mattermost-redux/types/config';

import {id as pluginId} from 'manifest';
import I18nProvider from 'components/i18n_provider';
import JaaSSection from './jaas_section';
import {RadioField} from '../RadioField';
import JitsiSection, {JITSI_NAMING_SCHEME} from './jitsi_section';
import {InputElementType} from 'types';

type Props = {
    id: string,
    label: string,
    value: Settings,
    disabled: boolean,
    config: AdminConfig,
    license: object,
    setByEnv: boolean,
    onChange: Function,
    registerSaveAction: Function,
    setSaveNeeded: Function,
    unRegisterSaveAction: Function
};

type Settings = {
    usejaas?: boolean,
    jitsiurl?: string,
    jitsiembedded?: boolean,
    jitsinamingscheme?: string,
    jitsijwt?: boolean,
    jitsiappid?: string,
    jitsiappsecret?: string,
    jitsilinkvalidtime?: number,
    jitsicompatibilitymode?: boolean,
    jaasappid?: string,
    jaasapikey?: string,
    jaasprivatekey?: string
};

const JITSI_MODE = 'JITSI_MODE';
const JAAS_MODE = 'JAAS_MODE';

const DEFAULT_JITSI_URL = 'https://meet.jit.si';
const JITSI_LINK_VALID_TIME = 30;
const DEFAULT_SETTINGS: Settings = {
    usejaas: false,
    jitsiurl: DEFAULT_JITSI_URL,
    jitsiembedded: false,
    jitsinamingscheme: JITSI_NAMING_SCHEME.WORDS,
    jitsijwt: false,
    jitsiappid: '',
    jitsiappsecret: '',
    jitsilinkvalidtime: JITSI_LINK_VALID_TIME,
    jitsicompatibilitymode: false,
    jaasappid: '',
    jaasapikey: '',
    jaasprivatekey: ''
};

const JitsiSettings = ({id, value, disabled, config, onChange, setSaveNeeded}: Props) => {
    const selectedMode = value?.usejaas ? JAAS_MODE : JITSI_MODE;

    const configuration = config.PluginSettings.Plugins[pluginId];
    const selectedSettings = {
        jitsiurl: configuration.jitsiurl || DEFAULT_SETTINGS.jitsiurl,
        jitsiappsecret: configuration.jitsiappsecret || DEFAULT_SETTINGS.jitsiappsecret,
        jitsiappid: configuration.jitsiappid || DEFAULT_SETTINGS.jaasappid,
        jitsicompatibilitymode: configuration.jitsicompatibilitymode || DEFAULT_SETTINGS.jitsicompatibilitymode,
        jitsiembedded: configuration.jitsiembedded || DEFAULT_SETTINGS.jitsiembedded,
        jitsijwt: configuration.jitsijwt || DEFAULT_SETTINGS.jitsijwt,
        jitsilinkvalidtime: configuration.jitsilinkvalidtime || DEFAULT_SETTINGS.jitsilinkvalidtime,
        jitsinamingscheme: configuration.jitsinamingscheme || DEFAULT_SETTINGS.jitsinamingscheme,
        usejaas: DEFAULT_SETTINGS.usejaas,
        jaasappid: DEFAULT_SETTINGS.jaasappid,
        jaasapikey: DEFAULT_SETTINGS.jaasapikey,
        jaasprivatekey: DEFAULT_SETTINGS.jaasprivatekey
    };

    const [settings, setSettings] = useState(value ?? selectedSettings);
    const [mode, setMode] = useState(selectedMode);

    const JITSI_SERVER_OPTIONS = [
        {
            value: JITSI_MODE,
            checked: mode === JITSI_MODE,
            label: (
                <FormattedMessage
                    id='jitsi.input-enable-jitsi'
                    defaultMessage={'Jitsi'}
                />
            )
        },
        {
            value: JAAS_MODE,
            checked: mode === JAAS_MODE,
            label: (
                <FormattedMessage
                    id='jitsi.input-enable-jass'
                    defaultMessage={'JasS'}
                />
            )
        }
    ];

    useEffect(() => {
        onChange(id, settings);
        setSaveNeeded();
    }, [settings]);

    const onModeSelected = (e: ChangeEvent<HTMLInputElement>) => {
        setSettings({
            ...settings,
            usejaas: e.target.value === JAAS_MODE
        });
        setMode(e.target.value);
    };

    const updateSettingsState = (key: string, newValue: string | boolean) => {
        setSettings({
            ...settings,
            [key]: newValue
        });
    };

    const onJaaSApiKeyChanged = (e: ChangeEvent<InputElementType>) => {
        updateSettingsState('jaasapikey', e.target.value);
    };

    const onJaaSAppIDChanged = (e: ChangeEvent<InputElementType>) => {
        updateSettingsState('jaasappid', e.target.value);
    };

    const onJaaSPrivateKeyChanged = (e: ChangeEvent<InputElementType>) => {
        updateSettingsState('jaasprivatekey', e.target.value);
    };

    // We reuse some of the Jitsi settings for JaaS
    const onJaaSEmbeddedChanged = (e: ChangeEvent<InputElementType>) => {
        updateSettingsState('jitsiembedded', e.target.value === 'true');
    };

    const onJaaSCompatibilityChange = (e: ChangeEvent<InputElementType>) => {
        updateSettingsState('jitsicompatibilitymode', e.target.value === 'true');
    };

    const onJitsiAppIDChanged = (e: ChangeEvent<InputElementType>) => {
        updateSettingsState('jitsiappid', e.target.value);
    };

    const onJitsiAppSecretChanged = (e: ChangeEvent<InputElementType>) => {
        updateSettingsState('jitsiappsecret', e.target.value);
    };

    const onJitsiCompatibilityChanged = (e: ChangeEvent<InputElementType>) => {
        updateSettingsState('jitsicompatibilitymode', e.target.value === 'true');
    };

    const onJitsiEmbeddedChanged = (e: ChangeEvent<InputElementType>) => {
        updateSettingsState('jitsiembedded', e.target.value === 'true');
    };

    const onJitsiAuthChanged = (e: ChangeEvent<InputElementType>) => {
        updateSettingsState('jitsijwt', e.target.value === 'true');
    };

    const onJitsiMeetingLinkExpChanged = (e: ChangeEvent<InputElementType>) => {
        updateSettingsState('jitsilinkvalidtime', e.target.value);
    };

    const onJitsiMeetingNamesChanged = (e: ChangeEvent<InputElementType>) => {
        updateSettingsState('jitsinamingscheme', e.target.value);
    };

    const onJitsiURLChanged = (e: ChangeEvent<InputElementType>) => {
        updateSettingsState('jitsiurl', e.target.value);
    };

    const jitsiSection = (
        <JitsiSection
            disabled={disabled}
            onJitsiAppIDChange={onJitsiAppIDChanged}
            onJitsiAppSecretChange={onJitsiAppSecretChanged}
            onJitsiCompatibilityChange={onJitsiCompatibilityChanged}
            onJitsiEmbeddedChange={onJitsiEmbeddedChanged}
            onJitsiJwtAuthChange={onJitsiAuthChanged}
            onJitsiMeetingLinkExpChange={onJitsiMeetingLinkExpChanged}
            onJitsiMeetingNamesChange={onJitsiMeetingNamesChanged}
            onJitsiURLChange={onJitsiURLChanged}
            serverUrl={settings.jitsiurl ?? ''}
            embedded={settings.jitsiembedded ?? false}
            namingScheme={settings.jitsinamingscheme ?? JITSI_NAMING_SCHEME.WORDS}
            jwtEnabled={settings.jitsijwt ?? false}
            appID={settings.jitsiappid ?? ''}
            appSecret={settings.jitsiappsecret ?? ''}
            meetingLinkExpire={settings.jitsilinkvalidtime ?? JITSI_LINK_VALID_TIME}
            compatibilityMode={settings.jitsicompatibilitymode ?? false}
        />
    );

    const jaasSection = (
        <JaaSSection
            disabled={disabled}
            onApiKeyIDChange={onJaaSApiKeyChanged}
            onAppIDChange={onJaaSAppIDChanged}
            onPrivateKeyChange={onJaaSPrivateKeyChanged}
            onEmbeddedChange={onJaaSEmbeddedChanged}
            onCompatibilityChange={onJaaSCompatibilityChange}
            appID={settings.jaasappid ?? ''}
            apiKey={settings.jaasapikey ?? ''}
            privateKey={settings.jaasprivatekey ?? ''}
            embedded={settings.jitsiembedded ?? false}
            compatibilityMode={settings.jitsicompatibilitymode ?? false}
        />
    );

    return (
        <I18nProvider>
            <div>
                <RadioField
                    heading={
                        <FormattedMessage
                            id='jitsi.server'
                            defaultMessage={'Server:'}
                        />
                    }
                    isInline={true}
                    options={JITSI_SERVER_OPTIONS}
                    onChange={onModeSelected}
                    description={
                        <FormattedMessage
                            id='jitsi.serever-description'
                            defaultMessage={'Select the type of jitsi server you want to use.'}
                        />
                    }
                />
                <hr style={{height: '3px'}}/>
                {mode === JAAS_MODE ? jaasSection : jitsiSection}
            </div>
        </I18nProvider>
    );
};

export default JitsiSettings;
