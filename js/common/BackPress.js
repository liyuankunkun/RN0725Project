
import React from 'react';
import {
    BackHandler
} from 'react-native';
export default class BackPress {
    constructor(props) {
        this.props = props;
        this._hardwareBackPress = this.onHardWareBackPress;
    }
    componentDidMount() {
        if (this.props.backPress) BackHandler.addEventListener('hardwareBackPress', this._hardwareBackPress);
    }
    componentWillUnmount(){
        if(this.props.backPress) BackHandler.removeEventListener('hardwareBackPress',this._hardwareBackPress);
    }
    onHardWareBackPress = (e) => {
        return this.props.backPress(e);
    }
}