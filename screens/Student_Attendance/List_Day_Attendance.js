import React, {Component} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import firebase from 'react-native-firebase';
import AsyncStorage from '@react-native-community/async-storage';
import Global from '../../constants/global/Global';
import Tittle from '../Header/Tittle';

const {width: WIDTH} = Dimensions.get ('window');
const {height: HEIGHT} = Dimensions.get ('window');

class FlatListItem extends Component {
  constructor (props) {
    super (props);
    this.state = {
        userData:{},
    };
  }
  componentDidMount () {
    this.getUserData ();
  }
  getUserData = async () => {
    await AsyncStorage.getItem ('userData').then (value => {
      const userData = JSON.parse (value);
      this.setState ({userData: userData});
    });
  };
  render () {
    return (
      <View style={style.viewOneClass}>
        <TouchableOpacity style={style.viewFlatList}
          onPress={() =>this.props.navigation.navigate ('View_Attendance_Day',{ngaydiemdanh:this.props.item})}
        >
          <View style={{flexDirection: 'row',alignItems: 'center',justifyContent: 'space-between',flex: 1 }} >
            <View style={[ styles.styleColumn,{flex: 1, borderLeftWidth: 0.5, borderLeftColor: 'gray'},]} >
                <Text>{this.props.index+1}</Text>
            </View>
            <View style={[styles.styleColumn, {flex: 7}]}>
              <Text style={{fontSize: 12, fontWeight: '700', opacity: 0.7}}>
                {this.props.item}
              </Text>
            </View>
            {/* <View style={[styles.styleColumn, {flex: 2}]}>
              <Text style={{fontSize: 12, fontWeight: '700', opacity: 0.7}}>
                {this.state.check}
              </Text>
            </View> */}
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}
const style = StyleSheet.create ({
  viewOneClass: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    width: WIDTH * 0.97,
    borderBottomColor: 'gray',
    borderBottomWidth: 0.5,
  },
  viewFlatList: {
    flexDirection: 'row',
    height: HEIGHT / 15,
    width: WIDTH,
    alignItems: 'center',
    width: WIDTH * 0.97,
    backgroundColor: '#fff',
  },
  styleText: {
    fontSize: 12,
    color: 'gray',
  },
  styleColumn: {
    alignItems: 'center',
    width: WIDTH * 0.1,
    borderRightWidth: 0.5,
    borderRightColor: 'gray',
    height: HEIGHT / 15,
    justifyContent: 'center',
  },
});
var thoigian = new Date ();
var date = thoigian.getDate ();
var month = thoigian.getMonth () + 1;
var year = thoigian.getFullYear ();
var datecurrent = year + '-' + month + '-' + date;

export default class List_Day_Attendance extends Component {
  static navigationOptions = {
    header: null,
  };
  state = {currentUser: null};
  constructor (props) {
    super (props);
    this.state = {
      userData: {},
      isChecked: 'Đang Xử Lý',
      show: false,
      datecurrent: datecurrent,
      class: [],
      classDone: [],
      ngaydiemdanh_temp:[],
      ngaydiemdanh :[],
      status: false,
      router: 'List_Attendanced',
      tittle: 'NGÀY ĐÃ ĐIỂM DANH',
    };
    Global.arrayClass = this.state.class;
    Global.tittle = this.state.tittle;
  }

  async componentDidMount () {
    Global.router = this.state.router;
    await this.getUserData ();
    const {currentUser} = firebase.auth ();
    this.setState ({currentUser});
    //lấy danh sách lớp HOC SINH ĐÃ THAM GIA VỀ
    await firebase.database().ref().child('Relationship/' + this.state.userData.MSSV).on('value', async childSnapshot => {
      const classRoom = [];
      childSnapshot.forEach(doc => {
        classRoom.push({
          key: doc.val(),
        });
        this.setState({
          class: classRoom,
        });
      });
      var arr = [];
      var arrTemp= [];
      this.state.class.forEach(async element => {
        console.log('check',element.key)
        await firebase.database().ref('Manage_Class/' + element.key + '/Attendance').on('value', value => {
          if (value.exists()) {
            // this.setState({
            //   diemdanh:'✔',
            // })
            // console.log('va')
            // arrTemp.push(value);
            value.forEach( x =>{
              arrTemp.push( x.key);
              let ans = deduplicate(arrTemp);
              function deduplicate(arr) {
                let isExist = (arr, x) => arr.indexOf(x) > -1;
                let ans = [];
                arr.forEach(element => {
                  if(!isExist(ans, element)) ans.push(element);
                });
                return ans;
              }
              this.setState({
                ngaydiemdanh_temp:ans
              })
            }) 
            Global.diemdanh = this.state.diemdanh;
            firebase.database().ref('Manage_Class/' + element.key).on('value', async(value) => {
              if (value.exists()) {
                await   arr.push({ className: value.toJSON().className, key: element.key });
                this.setState({
                      classDone: arr,
                });
              }
            })
          }
        });
      });
    });
}
  getUserData = async () => {
    await AsyncStorage.getItem ('userData').then (value => {
      const userData = JSON.parse (value);
      this.setState ({userData: userData});
    });
  };
  render () {
    const {currentUser} = this.state;
    return (
      <View style={styles.container}>
        {/* <Tittle onGoBack={() => this.props.navigation.goBack ()} /> */}
        <Tittle {...this.props} />
        <View style={{marginTop: 5}}>
          <View style={styles.header}>
            <View style={[styles.styleColumn, {flex: 1}]}>
              <Text>STT</Text>
            </View>
            <View style={[styles.styleColumn, {flex: 7}]}>
              <Text style={{fontSize: 12, fontWeight: '700', opacity: 0.7}}>
                NGÀY ĐIỂM DANH
              </Text>
            </View>
          </View>
        </View>
        

        <FlatList
          data={this.state.ngaydiemdanh_temp}
          style={{marginVertical: 0}}
          renderItem={({item, index}) => {
            return (
              <FlatListItem
                item={item}
                index={index}
                parentFlatList={this}
                {...this.props}
              />
            );
          }}
          keyExtractor={(item, id) => item.id}
        />
        {/* <View >
            <TouchableOpacity style={styles.viewButton}
            onPress={() =>
                this.props.navigation.navigate ('Attendance')}
            >
                <Text>Theo dõi những ngày điểm danh khác</Text>
            </TouchableOpacity>
        </View> */}
      </View>
    );
  }
}

const styles = StyleSheet.create ({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(112, 119, 127, 0.3)',
    alignItems: 'center',
  },
  header: {
    height: HEIGHT / 15,
    backgroundColor: '#537791',
    width: WIDTH * 0.97,
    borderLeftWidth: 0.5,
    borderLeftColor: 'gray',
    borderTopColor: 'gray',
    borderTopWidth: 0.5,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  styleColumn: {
    alignItems: 'center',
    borderRightWidth: 0.5,
    borderRightColor: 'gray',
    height: HEIGHT / 15,
    justifyContent: 'center',
  },
  viewButton:{
    height: HEIGHT / 15,
    backgroundColor: '#537791',
    width: WIDTH ,
    borderLeftWidth: 0.5,
    borderLeftColor: 'gray',
    borderTopColor: 'gray',
    borderTopWidth: 0.5,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
