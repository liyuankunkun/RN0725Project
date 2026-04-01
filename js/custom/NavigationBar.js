import React, { Component } from 'react';
import { View, Text, StatusBar, StyleSheet, Platform } from 'react-native';
import PropTypes from 'prop-types';
import Theme from '../res/styles/Theme';

const NAV_BAR_HEIGHT_IOS = 44;
const NAV_BAR_HEIGHT_ANDROID = 50;

const StatusBarShape = {
    barStyle: PropTypes.oneOf(['light-content', 'default', 'dark-content']),
    hidden: PropTypes.bool,
    backgroundColor: PropTypes.string,
    translucent: PropTypes.bool,
};

export default class NavigationBar extends Component {
    static propTypes = {
        style: PropTypes.object,
        title: PropTypes.string,
        titleView: PropTypes.element,
        titleStyle: PropTypes.object,
        hide: PropTypes.bool,
        statusBar: PropTypes.shape(StatusBarShape),
        rightButton: PropTypes.element,
        leftButton: PropTypes.element,
        hideLeft: PropTypes.bool,
    };

    static defaultProps = {
        statusBar: {
            barStyle: 'dark-content',
            hidden: false,
            translucent: false,
        },
    };

    render() {
        if (this.props.hide) {
            return null;
        }

        let statusBar = !this.props.statusBar.hidden ?
            <StatusBar {...this.props.statusBar} /> : null;

        let titleView = this.props.titleView ? this.props.titleView :
            <Text ellipsizeMode="head" numberOfLines={1} style={[styles.title, this.props.titleStyle]}>{this.props.title}</Text>;

        let content = this.props.hide ? null :
            <View style={styles.navBar}>
                <View style={styles.leftBtn}>
                    {this.props.leftButton}
                </View>
                <View style={[styles.navBarTitleContainer, this.props.titleLayoutStyle]}>
                    {titleView}
                </View>
                <View style={styles.rightBtn}>
                    {this.props.rightButton}
                </View>
            </View>;

        return (
            <View style={[styles.container, this.props.style]}>
                {statusBar}
                {content}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff', // 默认背景色
    },
    navBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: Platform.OS === 'ios' ? NAV_BAR_HEIGHT_IOS : NAV_BAR_HEIGHT_ANDROID,
    },
    navBarTitleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        left: 40,
        right: 40,
        top: 0,
        bottom: 0,
    },
    title: {
        fontSize: 18,
        color: '#333',
        fontWeight: 'bold',
    },
    leftBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginLeft: 8,
    },
    rightBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginRight: 8,
    },
});