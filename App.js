import { StackNavigator } from 'react-navigation';
import HomeScreen from './components/HomeScreen';
import RoutesScreen from './components/RoutesScreen';
import RouteScreen from './components/RouteScreen';

export default StackNavigator({
  Home: { screen: HomeScreen },
  Routes: { screen: RoutesScreen },
  Route: { screen: RouteScreen },
})