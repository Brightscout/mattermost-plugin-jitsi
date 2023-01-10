import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import JaaSConference from './components/conference/jaas_conference';
function JaaSRoot() {
    return (<JaaSConference/>);
}

ReactDOM.render(<JaaSRoot/>, document.getElementById('jaas-root'));
