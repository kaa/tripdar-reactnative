import React from 'react';
import { Image, StyleSheet, FlatList, Text, Button, View } from 'react-native';
import RNGooglePlaces from 'react-native-google-places';
import { routeBetween } from '../routing';

export default class HomeScreen extends React.Component {
  state = {};
  static navigationOptions = {
    header: null
  };
  async handlePick(waypoint) {
    try {
      var place = await RNGooglePlaces.openAutocompleteModal({
        type: 'cities',
        country: 'FI'
      });
      console.log(place);
      this.setState({[waypoint]: place.address})
      this.maybeRoute();
    } catch(err) {
      console.error(err);
    }
  }
  async maybeRoute() {
    if(!this.state.start || !this.state.destination)
      return; 

    this.setState({loading: true, error: null});
    try {
      var routes = await routeBetween(this.state.start, this.state.destination);
      if(routes.length==0) {
        this.setState({loading: false, error: new Error("No routes found")});
        return;
      } 
      this.setState({loading: false});
      if(routes.length==1) {
        this.props.navigation.navigate("Route", { route: routes[0] });
      } else {
        this.props.navigation.navigate("Routes", { routes: routes, start: this.state.start, destination: this.state.destination });
      }
    } catch(err) {
      this.setState({loading: false, error: err});
      return;
    }
  }
  renderError(error) {
    return (
      <View style={{marginTop: 50}}>
        <Text>Error routing. {error.toString()}</Text>
        <Button title="Retry" onPress={() => this.setState({error: null, start: null, destination: null })}/>
      </View>
    )
  }
  renderLoading() {
    return (
      <View style={{marginTop: 50}}>
        <Text>Loading routes</Text>
      </View>
    )
  }
  renderSelect() {
    return (
      <View style={{flex: 1, justifyContent: "flex-end", marginBottom: 50 }}>
        <Image source={require("../assets/wi-day-haze.png")} />
        <Button onPress={() => this.handlePick("start")} title="Pick start"/>
        <Button onPress={() => this.handlePick("destination")} title="Pick destination"/>
      </View>
    )
  }
  render() {
    return (
      this.state.error ? this.renderError(this.state.error) :
      this.state.loading ? this.renderLoading() :
      this.renderSelect()
    )
  }
}
