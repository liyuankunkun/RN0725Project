import React, {Component} from 'react';
import {
  StyleSheet,
  View
} from 'react-native';
// import OrderListItem1 from '../../flight/OrderListItem'
// import OrderListItem2 from '../../intlFlight/OrderListItem'
// import OrderListItem3 from '../../hotel/OrderListItem'
// import OrderListItem4 from '../../inflHotel/InterOrderListItem'
// import OrderListItem5 from '../../train/OrderListItem'


import Theme from '../../../res/styles/Theme'

export default class HomeUnTravelItem extends React.Component {
  render() {
    const {itemData} = this.props;
    return (
      <View style={{backgroundColor:Theme.normalBg}}>
           {/* {itemData.catego == 'train'?//js判断一定要用双等号
              <OrderListItem5 order={itemData.order} dontShow={true}/>
              :
                (   itemData.catego == 'flight'?
                    <OrderListItem1 order={itemData.order} dontShow={true}/>
                    :
                    ( itemData.catego == "hotel"?
                        <OrderListItem3 data={itemData.order} dontShow={true}/> 
                        :
                        (itemData.catego == 'Inflflight'?
                          <OrderListItem2 order={itemData.order} dontShow={true}/>
                           :
                            (itemData.catego == 'IntlHotel'?
                              <OrderListItem4 data={itemData.order} dontShow={true}/>
                       :null
                            )
                        )
                    )
                )
            } */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  listStyle: {
    
  },
  
});
