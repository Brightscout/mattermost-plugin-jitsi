import {getFullName} from 'mattermost-redux/utils/user_utils';
import {UserProfile} from 'mattermost-redux/types/users';

import {Config} from '../types';
import constants from 'constants/constants';

// eslint-disable-next-line no-useless-escape
const MEETING_ID_REGEX = '(vpaas-magic-cookie-[a-f0-9]{32}\/.+)';

export function displayUsernameForUser(user: UserProfile | null, config: Config): string {
    if (user) {
        const nameFormat = config.TeammateNameDisplay;
        let name = user.username;
        if (nameFormat === 'nickname_full_name' && user.nickname && user.nickname !== '') {
            name = user.nickname;
        } else if ((user.first_name || user.last_name) && (nameFormat === 'nickname_full_name' || nameFormat === 'full_name')) {
            name = getFullName(user);
        }

        return name;
    }

    return '';
}

export function checkMeetingAndServerType(meetingLink:string, useJass:Boolean): boolean {
    const meetingURL = new URL(meetingLink);
    const meetingId = meetingURL.searchParams.get(constants.MEETING_ID);
    var regex = new RegExp(MEETING_ID_REGEX);
    if (meetingId && regex.test(meetingId) !== useJass) {
        return true;
    }
    return false;
}
