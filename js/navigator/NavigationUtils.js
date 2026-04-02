import { CommonActions, StackActions } from '@react-navigation/native';

/**
 * 导航工具类 - 适配 React Navigation 6.x
 */
export default class NavigationUtils {
    /**
     * 跳转到指定页面
     * @param {Object} navigation - navigation 对象
     * @param {string} routeName - 路由名称
     * @param {Object} [params] - 路由参数
     */
    static push(navigation, routeName, params) {
        if (!navigation) {
            console.warn('NavigationUtils.push: navigation is null');
            return;
        }
        if (!routeName) {
            console.warn('NavigationUtils.push: routeName is empty');
            return;
        }
        let nav = navigation;
        for (let i = 0; i < 4 && nav; i++) {
            const state = nav.getState && nav.getState();
            const hasRoute =
                (state && Array.isArray(state.routeNames) && state.routeNames.includes(routeName)) ||
                (state && Array.isArray(state.routes) && state.routes.some(r => r && r.name === routeName));
            if (hasRoute) {
                if (typeof nav.navigate === 'function') {
                    nav.navigate(routeName, params);
                    return;
                }
                if (typeof nav.dispatch === 'function') {
                    nav.dispatch(
                        CommonActions.navigate({
                            name: routeName,
                            params: params,
                        })
                    );
                    return;
                }
                break;
            }
            nav = nav.getParent && nav.getParent();
        }
        if (typeof navigation.navigate === 'function') {
            navigation.navigate(routeName, params);
            return;
        }
        if (typeof navigation.dispatch === 'function') {
            navigation.dispatch(
                CommonActions.navigate({
                    name: routeName,
                    params: params,
                })
            );
            return;
        }
        console.warn('NavigationUtils.push: navigation has no navigate/dispatch');
    }

    /**
     * 使用 dispatch 进行跳转 (替代旧版 NavigationActions)
     * @param {Object} navigation - navigation 对象
     * @param {string} routeName - 路由名称
     * @param {Object} [params] - 路由参数
     */
    static dispatchPush(navigation, routeName, params) {
        if (!navigation) {
            console.warn('NavigationUtils.dispatchPush: navigation is null');
            return;
        }
        navigation.dispatch(
            CommonActions.navigate({
                name: routeName,
                params: params,
            })
        );
    }

    /**
     * 返回上一页
     * @param {Object} navigation - navigation 对象
     */
    static pop(navigation) {
        if (!navigation) {
            console.warn('NavigationUtils.pop: navigation is null');
            return;
        }
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    }

    /**
     * 返回到栈顶（根页面）
     * @param {Object} navigation - navigation 对象
     */
    static popToTop(navigation) {
        if (!navigation) {
            console.warn('NavigationUtils.popToTop: navigation is null');
            return;
        }
        const state = navigation.getState && navigation.getState();
        const hasMain =
            (state && Array.isArray(state.routeNames) && state.routeNames.includes('Main')) ||
            (state && Array.isArray(state.routes) && state.routes.some(r => r && r.name === 'Main'));
        if (hasMain) {
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Main' }],
                })
            );
            return;
        }
        navigation.popToTop();
    }

    /**
     * 修改当前页面参数
     * @param {Object} navigation - navigation 对象
     * @param {Object} params - 新参数
     */
    static setParams(navigation, params) {
        if (!navigation) {
            console.warn('NavigationUtils.setParams: navigation is null');
            return;
        }
        navigation.setParams(params);
    }

    /**
     * 获取指定参数值
     * 注：在 React Navigation 6.x 中，参数通常通过 route.params 获取，而非直接从 navigation 获取
     * @param {Object} route - route 对象 (注意：这里传的是 route 而不是 navigation)
     * @param {string} key - 参数键名
     * @param {*} [defaultValue] - 默认值
     */
    static getParam(route, key, defaultValue) {
        if (!route || !route.params) {
            return defaultValue;
        }
        return route.params[key] !== undefined ? route.params[key] : defaultValue;
    }

    /**
     * 获取所有参数
     * @param {Object} route - route 对象
     */
    static getParams(route) {
        return (route && route.params) || {};
    }
    
    /**
     * 重置路由栈到指定页面
     * @param {Object} navigation 
     * @param {string} routeName 
     * @param {Object} params 
     */
    static resetTo(navigation, routeName, params) {
         if (!navigation) return;
         navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: routeName, params }],
            })
        );
    }
}
