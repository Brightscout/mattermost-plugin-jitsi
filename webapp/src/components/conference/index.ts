import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';
import {GenericAction} from 'mattermost-redux/types/actions';
import {getCurrentChannelId, getCurrentUser, getCurrentUserId} from 'mattermost-redux/selectors/entities/common';

import {GlobalState} from 'types';
import {openJitsiMeeting, setUserStatus, sendEphemeralPost} from '../../actions';
import Conference from './conference';

function mapStateToProps(state: GlobalState) {
    const config = state['plugins-jitsi'].config;
    return {
        currentUser: getCurrentUser(state),
        currentChannelId: getCurrentChannelId(state),
        post: state['plugins-jitsi'].openMeeting,
        jwt: state['plugins-jitsi'].openMeetingJwt,
        useJaas: Boolean(config.use_jaas)

    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            openJitsiMeeting,
            setUserStatus,
            sendEphemeralPost
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Conference);
