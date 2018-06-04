import React from 'react';
import { StyleSheet, FlatList, Text, Button, View } from 'react-native';

export default class RoutesScreen extends React.Component {
  state = {}
  static navigationOptions = ({navigation: { state: { params: { start, destination, routes } } }}) => ({
    title: `${routes.length} from ${start} to ${destination}`
  });
  renderRoute({item,index}) {
    return (
      <View style={{borderBottomWidth: 1, borderBottomColor: "lightgray", backgroundColor: "white"}}>
        <Button style={{align: "left"}} title={item.description} onPress={this.selectItem.bind(this, index)}/>
      </View>
    )
  }
  selectItem(index) {
    this.props.navigation.navigate("Route", {route: this.props.navigation.state.params.routes[index] });
  }
  render() {
    var routes = this.props.navigation.state.params.routes;
    return <FlatList
      data={routes}
      renderItem={this.renderRoute.bind(this)}
      keyExtractor={route => route.description}
    />
  }
}
