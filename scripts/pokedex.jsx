import PokemonInfo from './pokemonInfo.jsx'
import PokemonList from './pokemonList.jsx'
import PokemonSearch from './pokemonSearch.jsx'
import React from 'react'
import {Router, Route, Link, hashHistory, IndexRoute} from 'react-router'
import ReactDOM from 'react-dom'
import $ from 'jquery'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

var locationKeys = [];
var locationIdx = 0;

var Pokedex = React.createClass({
  getInitialState: function() {
    return {originalList: [], filteredList: []};
  },
  componentWillMount: function() {
    this.loadPokemonList();
  },
  loadPokemonList: function(){
    console.log('loading pokemon list');
    $.ajax({
        url: "http://pokeapi.co/api/v2/pokemon/" + "?limit=150",
        dataType: 'json',
        cache: true,
        success: function(data){
          this.setState({originalList: data.results, filteredList: data.results})
        }.bind(this),
        error: function(xhr, status, err) {
           console.log("error")
           console.error(this.props.url, status, err.toString());
        }.bind(this),
	       timeout:10000
    });
  },
  handlePokemonSearch: function(name){
     if (name === ""){
       this.setState({list: this.state.data.results})
       return;
     }
     var filteredList = this.state.originalList.filter(function(pokemon){
         return (pokemon.name.indexOf(name) !== -1);
     })
     this.setState({filteredList: filteredList});
  },
  getSegment: function() {
    return this.props.location.pathname.split('/')[1] || 'root';
  },
  rememberRoute: function() {
    locationKeys = locationKeys.slice(0, locationIdx);
    locationKeys.push(this.props.location.key);
    locationIdx++;
    console.log('push', locationKeys, locationIdx)
  },
  getTransition: function() {
    console.log('check', locationKeys, locationIdx)
    // first load
    if (locationIdx === 0) {
      return 'routeChange';
    }
    if (locationKeys[locationIdx-1] === this.props.location.key) {
      // back button
      locationIdx--;
      return 'reverseRouteChange';
    }
    if (locationKeys[locationIdx+1] === this.props.location.key) {
      // forward button
      locationIdx++;
      return 'routeChange';
    }
    // push
    return 'routeChange';
  },
  render: function(){
    return (
      <div className = "pokedex">
        <h1> ReactJS Pokedex </h1>
          <div className="listColumn col-md-4">
           <PokemonSearch search={this.handlePokemonSearch} />
           <PokemonList data={this.state.filteredList} onLink={this.rememberRoute} />
          </div>

          <div className="col-md-offset-1 col-md-6">
            <ReactCSSTransitionGroup 
              transitionName={this.getTransition()} 
              transitionEnterTimeout={600} transitionLeaveTimeout={600}>
               {React.cloneElement(this.props.children, { key: this.getSegment() })}
            </ReactCSSTransitionGroup>
          </div>
      </div>
    );
  }
});

var PokemonIndex = React.createClass({
  render() {
    return null
  }
})


ReactDOM.render(
  <Router history={hashHistory}>
    <Route path="/" component={Pokedex}>
      <IndexRoute component={PokemonIndex} />
      <Route path=":facts" component={PokemonInfo}></Route>
    </Route>
  </Router>,
  document.getElementById('root')
);
