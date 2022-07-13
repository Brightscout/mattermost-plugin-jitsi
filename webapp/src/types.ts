import {GlobalState as ReduxGlobalState} from 'mattermost-redux/types/store';
import {Post} from 'mattermost-redux/types/posts';

export type Config = {
    TeammateNameDisplay?: string
}

export type GlobalState = ReduxGlobalState & {
    'plugins-jitsi': {
        openMeeting: Post | null,
        openMeetingJwt: string | null,
        config: {
            embedded?: boolean,
            // eslint-disable-next-line camelcase
            naming_scheme?: 'ask' | 'words' | 'mattermost' | 'uuid'
        }
    }
}

export type InputFieldType = HTMLInputElement | HTMLTextAreaElement;

export type RadioOptionsType = {
    value: string;
    checked: boolean;
    id: string;
    message: string;
}

export enum Types {
    text = 'text',
    number = 'number',
    textArea = 'textarea',
}
