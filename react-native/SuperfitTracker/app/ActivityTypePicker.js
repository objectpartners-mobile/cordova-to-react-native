import React, { Component } from 'react';
import { View, TouchableOpacity, Text, Dimensions } from 'react-native';
import Picker from 'react-native-picker';

export default class ActivityTypePicker extends Component {
  constructor(props, context){
		super(props, context);
		this.state = {
			pickerData: ['Run', 'Walk', 'Bike', 'Other'],
			selectedValue: 'Run'
		};
	}

	_onPressHandle(){
		this.picker.toggle();
	}

	render(){
		return (
			<View style={{height: Dimensions.get('window').height}}>
				<TouchableOpacity style={{marginTop: 20}} onPress={this._onPressHandle.bind(this)}>
					<Text style={{marginLeft: 10}}>Choose Activity Type: {this.state.selectedValue}</Text>
				</TouchableOpacity>
				<Picker
					ref={picker => this.picker = picker}
					style={{height: 320}}
					showDuration={300}
					pickerData={this.state.pickerData}
					selectedValue={this.props.parent.state.activityType}
					onPickerDone={(pickedValue) => {
            this.setState({
              selectedValue: pickedValue
            });
            this.props.setActivityType(pickedValue[0]);
					}}
				/>
			</View>
		);
	}
}
