import React, { PureComponent } from 'react';
import { GoogleApiWrapper } from 'google-maps-react';

import styles from './Map.less';

var timerHandle = null;

var car = "M17.402,0H5.643C2.526,0,0,3.467,0,6.584v34.804c0,3.116,2.526,5.644,5.643,5.644h11.759c3.116,0,5.644-2.527,5.644-5.644 V6.584C23.044,3.467,20.518,0,17.402,0z M22.057,14.188v11.665l-2.729,0.351v-4.806L22.057,14.188z M22.057,14.188v11.665l-2.729,0.351v-4.806L22.057,14.188z M20.625,10.773 c-1.016,3.9-2.219,8.51-2.219,8.51H4.638l-2.222-8.51C2.417,10.773,11.3,7.755,20.625,10.773z M20.625,10.773 c-1.016,3.9-2.219,8.51-2.219,8.51H4.638l-2.222-8.51C2.417,10.773,11.3,7.755,20.625,10.773z M3.748,21.713v4.492l-2.73-0.349 V14.502L3.748,21.713z M3.748,21.713v4.492l-2.73-0.349 V14.502L3.748,21.713z M1.018,37.938V27.579l2.73,0.343v8.196L1.018,37.938z M1.018,37.938V27.579l2.73,0.343v8.196L1.018,37.938z M2.575,40.882l2.218-3.336h13.771l2.219,3.336H2.575z M2.575,40.882l2.218-3.336h13.771l2.219,3.336H2.575z M19.328,35.805v-7.872l2.729-0.355v10.048L19.328,35.805z M19.328,35.805v-7.872l2.729-0.355v10.048L19.328,35.805z";

class MapPage extends PureComponent {

  state = {
    map: null,
    directionsService: null,
    directionsDisplay: null,
    marker: null,
    polyline: null,
    poly2: null,
    eol: 0,
    icon: null,
    step: 20,
    tick: 100,
    lastVertex: 1,

    startLocation: {},
    endLocation: {},

    from: 'Khuất Duy Tiến, Thanh Xuân, Hanoi',
    to: 'My Dinh National Stadium, Đường Lê Đức Thọ, Mỹ Đình 1, Nam Từ Liêm, Hanoi'
  };

  componentDidMount() {
    // Instantiate a directions service.
    this.state.directionsService = new google.maps.DirectionsService();

    // Create a map and center it on Manhattan.
    var myOptions = {
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      center: {lat: 21.0142849, lng: 105.8110026},
    };

    let refMap = this.refs.refMap

    this.state.map = new google.maps.Map(refMap, myOptions);

    // Create a renderer for directions and bind it to the map.
    let rendererOptions = {
      map: this.state.map
    };

    this.state.directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);

    this.state.polyline = new google.maps.Polyline({
      path: [],
      strokeColor: '#f1f907',
      strokeWeight: 3
    });

    this.state.poly2 = new google.maps.Polyline({
      path: [],
      strokeColor: '#f1f907',
      strokeWeight: 3
    });

    this.state.icon = {
      path: car,
      scale: .6,
      strokeColor: '#fff',
      strokeWeight: .10,
      fillOpacity: 1,
      fillColor: '#404040',
      offset: '10%',
      anchor: new google.maps.Point(10, 25) // orig 10,50 back of car, 10,0 front of car, 10,25 center of car
    };
  }

  calcRoute = () => {

    if (timerHandle) clearTimeout(timerHandle);

    if (this.state.marker) this.state.marker.setMap(null);

    this.state.polyline.setMap(null);

    this.state.poly2.setMap(null);

    this.state.directionsDisplay.setMap(null);

    this.state.polyline = new google.maps.Polyline({
      path: [],
      strokeColor: '#171515',
      strokeWeight: 3
    });

    this.state.poly2 = new google.maps.Polyline({
      path: [],
      strokeColor: '#F61D1D',
      strokeWeight: 3
    });

    // Create a renderer for directions and bind it to the map.
    let rendererOptions = { map: this.state.map };

    this.state.directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);

    let start = this.state.from;
    let end = this.state.to;

    let travelMode = google.maps.DirectionsTravelMode.DRIVING;

    let request = {
      origin: start,
      destination: end,
      travelMode: travelMode
    };

    // Route the directions and pass the response to a
    // function to create markers for each step.

    this.state.directionsService.route(request, (response, status) => {
      if (status === google.maps.DirectionsStatus.OK) {

        this.state.directionsDisplay.setDirections(response);

        let bounds = new google.maps.LatLngBounds();
        let legs = response.routes[0].legs;

        for (let i = 0; i < legs.length; i++) {
          if (i === 0) {
            this.state.startLocation.latlng = legs[i].start_location;
            this.state.startLocation.address = legs[i].start_address;
          }

          this.state.endLocation.latlng = legs[i].end_location;
          this.state.endLocation.address = legs[i].end_address;

          let steps = legs[i].steps;

          for (let j = 0; j < steps.length; j++) {
            let nextSegment = steps[j].path;

            for (let k = 0; k < nextSegment.length; k++) {
              this.state.polyline.getPath().push(nextSegment[k]);
              bounds.extend(nextSegment[k]);
            }
          }
        }

        this.state.polyline.setMap(this.state.map);
        this.state.map.fitBounds(bounds);
        this.state.map.setZoom(14);

        this.startAnimation()
      }
    });
  }

  startAnimation = () => {
    this.state.map.setCenter(this.state.polyline.getPath().getAt(0));

    this.state.marker = new google.maps.Marker({
      position: this.state.polyline.getPath().getAt(0),
      map: this.state.map,
      icon: this.state.icon
    });

    this.state.poly2 = new google.maps.Polyline({
      path: [this.state.polyline.getPath().getAt(0)],
      strokeColor: "#0000FF",
      strokeWeight: 10
    });

    let polyGetPath = this.state.polyline.getPath();

    for (let i = 1; i < polyGetPath.getLength(); i++) {
      let first = polyGetPath.getAt(i);
      let end = polyGetPath.getAt(i - 1);
      this.state.eol += google.maps.geometry.spherical.computeDistanceBetween(first, end);
    }

    setTimeout(() => {
      this.animate(50)
    }, 200);
  }

  animate = (distance) => {
    if (distance > this.state.eol) {
      this.state.map.panTo(this.state.endLocation.latlng);
      this.state.marker.setPosition(this.state.endLocation.latlng);
      return;
    }

    let currentPoint = this.state.marker.getPosition();
    let newPoint = this.getPointAtDistance(this.state.polyline, distance);

    // Set camera theo oto
    //this.state.map.setCenter(newPoint);

    this.state.marker.setPosition(newPoint);

    let heading = google.maps.geometry.spherical.computeHeading(currentPoint, newPoint);

    this.state.icon.rotation = heading;

    this.state.marker.setIcon(this.state.icon);

    this.updatePoly(distance);

    timerHandle = setTimeout(() => {
      this.animate((distance + this.state.step))
    }, this.state.tick);
  }

  updatePoly = (distance) => {
    if (this.state.poly2.getPath().getLength() > 20) {
      //??
      let a = this.state.polyline.getPath().getAt(this.state.lastVertex - 1)
      this.state.poly2 = new google.maps.Polyline([a]);
    }

    if (this.getIndexAtDistance(this.state.polyline, distance) < (this.state.lastVertex + 2)) {
      if (this.state.poly2.getPath().getLength() > 1) {
        //??
        let b = this.state.poly2.getPath().getLength() - 1

        this.state.poly2.getPath().removeAt(b);
      }

      //??
      let d = this.state.poly2.getPath().getLength();

      //??
      let e = this.getIndexAtDistance(this.state.polyline, distance);

      this.state.poly2.getPath().insertAt(d, e);

    } else {
      //??
      let f = this.state.poly2.getPath().getLength();
      //??
      let g = this.state.endLocation.latlng;
      this.state.poly2.getPath().insertAt(f, g);
    }
  }

  getPointAtDistance = (polyline, metres) => {
    // some awkward special cases
    let polylineGetPath = polyline.getPath()

    if (metres === 0) return polylineGetPath.getAt(0);

    if (metres < 0) return null;
    if (polylineGetPath.getLength() < 2) return null;

    let dist = 0;
    let olddist = 0;

    for (var i = 1; (i < polylineGetPath.getLength() && dist < metres); i++) {
      olddist = dist;
      dist += google.maps.geometry.spherical.computeDistanceBetween(polylineGetPath.getAt(i), polylineGetPath.getAt(i - 1));
    }

    if (dist < metres) return null;

    let p1 = polylineGetPath.getAt(i - 2);
    let p2 = polylineGetPath.getAt(i - 1);
    let m = (metres - olddist) / (dist - olddist);

    return new google.maps.LatLng(p1.lat() + (p2.lat() - p1.lat()) * m, p1.lng() + (p2.lng() - p1.lng()) * m);
  }

  getIndexAtDistance = (polyline, metres) => {
    let polylineGetPath = polyline.getPath()

    // some awkward special cases
    if (metres === 0) return polylineGetPath.getAt(0);
    if (metres < 0) return null;

    let dist = 0;
    let olddist = 0;

    for (var i = 1; (i < polylineGetPath.getLength() && dist < metres); i++) {
      olddist = dist;
      dist += google.maps.geometry.spherical.computeDistanceBetween(polylineGetPath.getAt(i), polylineGetPath.getAt(i - 1));
    }

    if (dist < metres) return null;

    return i;
  }

  render() {
    return (
      <div>
        <div>
          {/* <input type="text" name="start" value={this.state.from} />
           <input type="text" name="end" value={this.state.to} /> */}
          <input type="submit" onClick={this.calcRoute} />
        </div>
        <div ref="refMap" className={styles.normal}>
        </div>
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyAvmn_H__M9iXKJ6m7LsjoBHqlWxXhMAIE'
})(MapPage)
