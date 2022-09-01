import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {getBool, getTheme} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {GenericAction, ActionFunc, ActionResult} from 'mattermost-redux/types/actions';
import {Post} from 'mattermost-redux/types/posts';

import {GlobalState} from '../../types';
import {displayUsernameForUser} from '../../utils/user_utils';
import {enrichMeetingJwt, openJitsiMeeting, setUserStatus, sendEphemeralPost} from '../../actions';
import {PostTypeJitsi} from './post_type_jitsi';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/common';

type OwnProps = {
    post: Post,
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const post = ownProps.post;
    const creator = state.entities.users.profiles[post.user_id];
    const config = state['plugins-jitsi'].config;

    return {
        ...ownProps,
        currentUser: getCurrentUser(state),
        currentChannelId: getCurrentChannelId(state),
        theme: getTheme(state),
        creatorName: displayUsernameForUser(creator, state.entities.general.config),
        useMilitaryTime: getBool(state, 'display_settings', 'use_military_time', false),
        meetingEmbedded: Boolean(config.embedded),
        useJaas: Boolean(config.use_jaas)
    };
}

type Actions = {
    enrichMeetingJwt: (jwt: string) => Promise<ActionResult>,
    openJitsiMeeting: (post: Post | null, jwt: string | null) => ActionResult,
    setUserStatus: (userId: string, status: string) => Promise<ActionResult>,
    sendEphemeralPost: (message: string, channelID: string, userID: string)=> ActionResult,
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            enrichMeetingJwt,
            openJitsiMeeting,
            setUserStatus,
            sendEphemeralPost
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PostTypeJitsi);
