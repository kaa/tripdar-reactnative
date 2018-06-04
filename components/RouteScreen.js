import React from 'react';
import { ActivityIndicator, Image, StyleSheet, FlatList, Text, View } from 'react-native';
import { describeRoute, fetchWeatherReports } from '../routing';
import Swiper from 'react-native-swiper';

export default class RouteScreen extends React.Component {
  static navigationOptions = ({navigation}) => {
    let {start, destination} = navigation.state.params.route;
    return {title: start+" to "+destination}
  };

  state = {}
   
  async componentDidMount() {
    this.refreshDescription(this.props.navigation.state.params.route);
  }

  async refreshDescription(route) {
    this.setState({loading: true, error: null, segments:null});
    try {
      var segments = await describeRoute(route);
      this.setState({loading: false, segments}, () => {
        this.refreshWeather();
      });
    } catch(error) {
      this.setState({loading: false, error});
    }
  }

  async refreshWeather() {
    const weatherReports = await fetchWeatherReports();
    const weatherReportMap = weatherReports
      .reduce((acc,r) => { acc[r.weatherStationId] = r; return acc }, {});
    const segments = this.state.segments;
    segments.forEach(s => {
      s.weatherReport = weatherReportMap[s.station.weatherStationId];
    });
    this.setState({ segments });
  }

  formatDistance(distance) {
    if(distance>1000) {
      return Math.round(distance/1000,2)+" km";
    } else {
      return Math.round(distance,2)+" m";
    }
  }

  renderItem({item,ix}) {
    let cameras = item.station.cameras.map((url,ix) => (
      <View key={ix} style={{flexDirection: "row", alignItems: "stretch", backgroundColor: "lightgray"}}>
        <Image style={[styles.stationImage]} source={{uri: url.replace("http","https") }} />
      </View>
    ));
    let weather = item.weatherReport != null
      ? <Text>{item.weatherReport.air.toString()}</Text>
      : null;
    return (
      <View style={[styles.listItem, {marginBottom: 15}]}>
        <View style={[styles.bar, { overflow: "visible" }]}>
          <Text style={{position: "absolute", backgroundColor: "transparent", color: "gray", width: 1000, top: 5, left: 15 }}>{this.formatDistance(item.distance)}</Text>
        </View>
        <View style={{flex: 1, flexDirection: "row", justifyContent: "center" }}>
          <Text style={[styles.stationTitle,{marginRight: 10}]}>{item.station.name}</Text>
          <Text style={[styles.stationTitle]}>{weather}</Text>
        </View>
        <Swiper dotStyle={{backgroundColor: "#fff3"}} activeDotStyle={{backgroundColor: "white"}} loop={false} style={{height:300}}>{cameras}</Swiper>
      </View>
    )
  }

  renderWeather(segment) {
  }

  renderHeader() {
    return (
      <View style={[styles.header,{marginTop: 15}]}>
        <Image style={[styles.headerImage]} source={require("../assets/wi-alien.png")}/>
        <Text style={styles.headerTitle}>{this.props.navigation.state.params.route.start}</Text>
      </View>
    )
  }
  renderFooter() {
    return (
      <View style={styles.header}>
        <View style={[styles.bar]} />
        <Text style={[styles.headerTitle, {marginTop: 15 }]}>{this.props.navigation.state.params.route.destination}</Text>
        <Image style={[styles.headerImage, {marginTop: 10}]} source={require("../assets/wi-alien.png")}/>
      </View>
    )
  }
  renderEmpty() {
    if(this.state.error) {
      return (
        <View>
          <Text>{this.state.error.toString()}</Text>
        </View>
      )
    } else if(this.state.loading) {
      return (
        <View style={[styles.listItem]}>
          <View style={[styles.bar]} />
          <ActivityIndicator style={{ marginTop: 15, marginBottom: 15 }} />
        </View>
      )
    } else {
      return (
        <View style={[styles.listItem]}>
          <View style={[styles.bar,{height: 50}]} />
          <Image style={[styles.headerImage,{marginTop: 15, marginBottom: 15}]} source={require("../assets/wi-alien.png")}/>
        </View>
      )
    }
  }
  render() {
    return (
      <View style={{alignItems: "stretch"}}>
        <FlatList
          data={this.state.segments}
          renderItem={this.renderItem.bind(this)}
          ListHeaderComponent={this.renderHeader.bind(this)}
          ListFooterComponent={this.renderFooter.bind(this)}
          ListEmptyComponent={this.renderEmpty.bind(this)}
          keyExtractor={item => item.station.roadStationId}
        />
      </View>
    )
  }
}
const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  header: {
    alignItems: "center",
    marginTop: 0,
    marginBottom: 15
  },
  headerImage: {
    marginBottom: 5
  },
  bar: {
    width:1.5,
    height: 25,
    backgroundColor: "gray"
  },
  listItem: {
    alignItems: "center"
  },
  stationTitle: {
    fontSize: 13,
    marginTop: 10,
    marginBottom: 10
  },
  stationImage: {
    flex: 1,
    aspectRatio: 1.2222
  }
});

