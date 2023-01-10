import {loadConfig} from '../src/actions';
import React, {useEffect} from 'react';
import {useDispatch} from 'react-redux';

const GetConfig = (): JSX.Element => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(loadConfig());
    }, []);

    // This container is used just for making the API call for fetching the config, it doesn't render anything.
    return <></>;
};

export default GetConfig;