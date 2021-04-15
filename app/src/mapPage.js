import React from 'react';
import {Map, GeoObject, Placemark, YMaps} from "react-yandex-maps";
import {getAltitude, getNearestCity, reverseGeocode} from "./mapAPI";

const earthRadiusGeodeticLatitude = require('earth-radius-at-geodetic-latitude');

class MapPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            latitude: '', longitude: '', enteredCity: '', enteredCityValidation: '', latValidation: '', lngValidation: '',
            currentLat: '', currentLng: '', currentCity: '', isCurrentLocationActive: false, permissionDenied: '',
            nearestDistance: '', nearestLat: '', nearestLng: '', zoom: 2, earthCurrentCityDistance: '',
            earthEnteredCityDistance: ''
        };
        this.handleLatChange = this.handleLatChange.bind(this);
        this.handleLngChange = this.handleLngChange.bind(this);
        this.handleSendCoordinates = this.handleSendCoordinates.bind(this);
        this.handleValidation = this.handleValidation.bind(this);
        this.handleCurrentCoordinates = this.handleCurrentCoordinates.bind(this);
        this.updateNearest = this.updateNearest.bind(this);
        this.handleEarthDistance = this.handleEarthDistance.bind(this);
    }

    handleLatChange(event){
        this.setState({latitude: event.target.value});
    }

    handleLngChange(event){
        this.setState({longitude: event.target.value});
    }

    handleEarthDistance(stateName, lat, lng){
        this.setState({[stateName]: ''});
        const distance = getAltitude(lat, lng);
        distance.then((result) => {
            this.setState({[stateName]: Math.round(result.elevations[0].elevation +
                                                           earthRadiusGeodeticLatitude(lat))});
        }).catch((error) => {
            console.log(error);
        });
    }

    handleSendCoordinates(){
        const validation = this.handleValidation();
        if (validation) {
            reverseGeocode(this.state.latitude, this.state.longitude).then((result) => {
                if (result.principalSubdivision !== undefined && result.principalSubdivision !== '' ){
                    this.setState({enteredCity: result.principalSubdivision, enteredCityValidation: ''});
                    this.handleEarthDistance("earthEnteredCityDistance", this.state.latitude, this.state.longitude);
                } else{
                    this.setState({enteredCity: '', enteredCityValidation: 'false'});
                }
            });
        }else
            this.setState({enteredCity: '', enteredCityValidation: ''});
    }

    handleCurrentCoordinates(){
            navigator.geolocation.getCurrentPosition((position) => {
                this.setState({currentLat: position.coords.latitude, currentLng: position.coords.longitude,
                                    permissionDenied: ''});
                                    reverseGeocode(position.coords.latitude, position.coords.longitude).then((result) => {
                    if (result.principalSubdivision !== undefined && result.principalSubdivision !== '' ){
                        this.setState({currentCity: result.principalSubdivision, isCurrentLocationActive: true});
                    } else{
                        this.setState({currentCity: '', isCurrentLocationActive: false});
                    }
                }).catch((error) => {
                    this.setState({currentCity: '', isCurrentLocationActive: false});
                }).finally(() => {
                    this.updateNearest();
                    this.handleEarthDistance("earthCurrentCityDistance", this.state.currentLat, this.state.currentLng);
                });

            }, (error) => {
                this.setState({currentLat: '', currentLng: '', currentCity: '', isCurrentLocationActive: false,
                                    permissionDenied: 'You need to enable locations'});
                console.log(error.message);
            });
    }

    handleValidation(){
        let isValid = true;
        if(this.state.latitude !== '' && !isNaN(this.state.latitude) && Math.abs(this.state.latitude) <= 90){
            this.setState({latValidation: ''});
        }else{
            this.setState({latValidation: "Invalid latitude"});
            isValid = false;
        }

        if(this.state.longitude !== '' && !isNaN(this.state.longitude) && Math.abs(this.state.longitude) <= 180){
            this.setState({lngValidation: ''});
        }else{
            this.setState({lngValidation: "Invalid longitude"});
            isValid = false;
        }

        return isValid;
    }

    updateNearest(){
        this.setState({zoom: 10});
        const nearest = getNearestCity(this.state.currentLat, this.state.currentLng);
        nearest.then((results) => {
            for (let i=0; i < results.data.length; i++){
                if (results.data[i].region.includes(this.state.currentCity) ||
                    results.data[i].name.includes(this.state.currentCity)){
                    this.setState({nearestLat: results.data[i].latitude,
                                        nearestLng: results.data[i].longitude,
                                        nearestDistance: results.data[i].distance })
                    break;
                }
                if (i === results.data.length-1){
                    this.setState({nearestLat: results.data[0].latitude,
                                        nearestLng: results.data[0].longitude,
                                        nearestDistance: results.data[0].distance })
                }
            }
        }).catch((error) => {
            this.setState({nearestLat: '', nearestLng: '', nearestDistance: '' });
            console.log(error);
        });
    }

    render() {
        console.log(this.state);
        return(
            
                <div class="row">
                    <div class="col-4">
                    <div className="col my-auto">
                    <div className="col-lg-2 my-auto">
                        <h4 className="">Enter Coordinates</h4>
                    </div>
                    <div className="col-lg-4 my-auto">
                        <div className="form-group row">
                            <label htmlFor="example-number-input" className="col-3 col-form-label">Latitude</label>
                            <div className="col-9">
                                <input className={this.state.latValidation === '' ? "form-control" : "form-control is-invalid"} type="number"
                                       value={this.state.latitude} onChange={this.handleLatChange} step="0.1" id="latitude"/>
                                <div className="invalid-feedback" id="latitudeValidation">{this.state.latValidation}</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4 my-auto">
                        <div className="form-group row">
                            <label htmlFor="example-number-input" className="col-3 col-form-label">Longitude</label>
                            <div className="col-9">
                                <input className={this.state.lngValidation === '' ? "form-control" : "form-control is-invalid"} type="number"
                                       value={this.state.longitude} onChange={this.handleLngChange} step="0.1" id="longitude"/>
                                <div className="invalid-feedback" id="longitudeValidation">{this.state.lngValidation}</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-2 mt-1">
                        <button type="button" className="btn btn-primary"  id="sendCoordinateButton"
                                onClick={this.handleSendCoordinates}>
                            send coordinates
                        </button>
                    </div>

                </div>
                <hr/>
                <div className={this.state.enteredCity === ''? "d-none" : "row"}>
                    <h4 className="m-auto w-100" id="enteredCity"> Entered coordinates are in {this.state.enteredCity}</h4>
                </div>
                <hr className={this.state.enteredCity === ''? "d-none" : ""}/>
                <div className={this.state.earthEnteredCityDistance === '' ? "d-none": "row justify-content-center"} id="enteredCityEarthCenterInformation">
                    <h4 id="earthCenterCurrentLocDistance">
                        Distance between entered location and the earth center is approximately {this.state.earthEnteredCityDistance} meters
                    </h4>
                </div>
                <hr className={this.state.earthEnteredCityDistance === ''? "d-none" : ""}/>
                <div className={this.state.enteredCityValidation === ''? "d-none" : "row"}  id="currentCityValidation">
                    <h4 className="m-auto w-100"> Couldn't find a city with given coordinates</h4>
                </div>
                <hr className={this.state.enteredCityValidation === ''? "d-none" : ""}/>
                <div className={this.state.isCurrentLocationActive ? "row" : "d-none"}>
                    <h4 id="currentCity" className="col-lg-4 m-auto">Current coordinates are in {this.state.currentCity}</h4>
                    <h4 id="currentLat" className="col-lg-4 m-auto">Current latitude is {this.state.currentLat}</h4>
                    <h4 id="currentLng" className="col-lg-4 m-auto">Current Longitude is {this.state.currentLng}</h4>
                </div>
                <hr className={this.state.isCurrentLocationActive ? "" : "d-none"}/>
                <div className={this.state.permissionDenied === '' ? "d-none": "row"}>
                        <h4 id="permissionDenied">
                            {this.state.permissionDenied}
                        </h4>
                </div>
                <hr className={this.state.permissionDenied === '' ? "d-none": "row"}/>
                <div className={this.state.nearestDistance === '' ? "d-none": ""} id="nearestCityInformation">
                    <h4 className="row justify-content-center" id="nearestDistance">
                        Approximate distance to the nearest city is {this.state.nearestDistance} kilometers.
                    </h4>
                    <h4 className="row justify-content-center" id="nearestLat">Nearest city latitude is {this.state.nearestLat}</h4>
                    <h4 className="row justify-content-center" id="nearestLng">Nearest city longitude is {this.state.nearestLng}</h4>
                </div>
                <hr className={this.state.nearestDistance === '' ? "d-none": "row"}/>
                <div className={this.state.earthCurrentCityDistance === '' ? "d-none": "row justify-content-center"} id="currentCityEarthCenterInformation">
                    <h4 id="earthCenterEnteredLocDistance">
                        Distance between current location and the earth center is approximately {this.state.earthCurrentCityDistance} meters
                    </h4>
                </div>
                <hr className={this.state.earthCurrentCityDistance === '' ? "d-none": ""}/>
                    </div>
                    <div class="col-8">
                    One of three columns
                    </div>                
                </div>                
            
        );
    }
}


export default MapPage;