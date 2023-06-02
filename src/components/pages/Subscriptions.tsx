import {
  View,
  Text,
  SafeAreaView,
  Platform,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome5';
import React, { useEffect, useState } from "react";
import { withLoadingSpinner } from "../hoc/withLoadingSpinner";
import {
  isIosStorekit2,
  PurchaseError,
  requestSubscription,
  useIAP,
  withIAPContext,
} from "react-native-iap";
import RNIap from "react-native-iap";
import { any } from "prop-types";
import { allPass, type } from "remeda";
import Loader from "../loader/Loader";
import { useDispatch } from 'react-redux';
import { from, switchMap } from 'rxjs';
import { theme } from "mediashare/styles";
import { loadProfile } from "mediashare/store/modules/profile";
import { updateAccount } from "mediashare/store/modules/user";
import moment from "moment";
const itemSKUs = Platform.select({
  ios: ['subscription_monthly_202301_1'],
  android: [


  ],
});
const Subscriptions = () => {
  const dispatch = useDispatch();
  const [loading, setloading] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false);
  var date = new Date()
  const [userData, setUserData] = useState(null)
  const {
    subscriptions,
    products,
    getSubscriptions,
    getProducts,
    currentPurchase,
    finishTransaction
  } = useIAP();
  useEffect(() => {
    handleGetSubscriptions();
  }, []);
  const handleGetSubscriptions = async () => {
    try {

      await getSubscriptions({ skus: itemSKUs as any })
      await getProducts({ skus: itemSKUs as any });

    } catch (error) {
      // console.warn(error.message, 'error.message');

    }
    setloading(false)
  };
  const handleBuySubscription = async (
    productId: string,
    offerToken?: string,
  ) => {
    setloading(true)
    try {
      await requestSubscription({
        sku: productId,
        ...(offerToken && {
          subscriptionOffers: [{ sku: productId, offerToken }],
        }),
      });
    } catch (error) {
      if (error instanceof PurchaseError) {
        // Alert.alert(error.message)
      } else {
        // Alert.alert(error)
      }
    }
    setloading(false)
  };

  // GET USER DATA ======================>
  useEffect(() => {
    async function loadData() {
      const profile = (await dispatch(loadProfile(null))) as any;
      console.log(profile, '<==*********=Subscriptions');
      setUserData(profile?.payload)
      // setState(profile.payload);
      setIsLoaded(true);
    }
    if (!isLoaded) {
      loadData().then();
    }
  }, []);


  useEffect(() => {
    const checkCurrentPurchase = async () => {
      try {
        if (
          (isIosStorekit2() && currentPurchase?.transactionId) ||
          currentPurchase?.transactionReceipt
        ) {
          await finishTransaction({
            purchase: currentPurchase,
            isConsumable: true,
          });
         
          completePayment(currentPurchase?.transactionId)
        }
      } catch (error) {
        if (error) {
          Alert.alert(error.message)
        } else {
        }
      }
    };
    checkCurrentPurchase();
  }, [currentPurchase, finishTransaction]);

  const completePayment = (transactionId:any) => {
    var startDate=new Date()
    const expirationDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate());
    console.log(moment(expirationDate).format('YYYY-MM-DD'),'<======expirationDate');
console.log(moment(startDate).format('YYYY-MM-DD'),'<======currentDate');

let body=
{
  _id: userData?._id || '',
  username: userData?.username ||'',
  email: userData?.email || '',
  firstName:userData?.firstName||'',
  lastName: userData?.lastName||'',
  phoneNumber: userData?.phoneNumber||'',
  role: userData?.role||'',
  imageSrc: userData?.imageSrc||'',
  authorId: userData?.authorId||'',
  author: userData?.author||'',
  authorImage: userData?.authorImage||'',
  authorName: userData?.authorName||'',
  transactionId:transactionId||'',
  transactionDate:moment(startDate).format('YYYY-MM-DD')||'',
  transactionEndDate:moment(expirationDate).format('YYYY-MM-DD')||''
}


    const updateUserDto = userData;
    console.log(updateUserDto, '<====updateUserDto');
   
    from(dispatch(updateAccount({ body, userId:  userData?._id })))
  
  }
  console.log(subscriptions,'<=====subscriptions');
  
  return (
    <SafeAreaView style={{ backgroundColor: theme.colors.background, flex: 1 }}>
      <Loader loading={loading} />
      <View style={{ paddingTop: 20 }}>
        {
          subscriptions?.map((item, index) => {
            return (
              <View style={styles.main_view} key={index}>
              <View style={styles.view2}>
                <View>
                  <Icon color={'white'} name="crown" size={25} />
                </View>
                <View style={{}}>
                  <Text style={styles.text}>{item?.title}</Text>
                  <View style={{flexDirection:"row",justifyContent:"space-between",paddingTop:3}}>

                  <Text style={styles.text2}>{1 + ' ' + item?.subscriptionPeriodUnitIOS }</Text>
                  <Text style={styles.text2}>{item?.localizedPrice}</Text>
                  </View>

                </View>
                <View>
                  <TouchableOpacity onPress={()=>handleBuySubscription(item?.productId)}  style={styles.touchable}>
                    <Text style={styles.buy}>Buy Now</Text>
                  </TouchableOpacity>

                </View>
              </View>
            </View>
            )
          })
        }
        {/* {
          subscriptions?.length>0 &&
        <View style={{ paddingHorizontal: 22, paddingTop: 20 }}>

          <Text style={{
            fontSize: 17,
            color: "white",
            fontWeight: "800"
          }}>Description</Text>
          <View style={{ paddingTop: 11 }}>
            <Text style={{color:"white"}}>You can get access to watch playlist for one month after buy this subscription.</Text>


          </View>
        </View>
        } */}
      </View>


    </SafeAreaView>
  );

};
export default withIAPContext(Subscriptions);
const styles = StyleSheet.create({
  main_view: {
    backgroundColor: "#00B8EC",
    width: '90%',
    borderRadius: 8,
    justifyContent: "center",
    alignSelf: "center",
    paddingVertical: 20
  },
  view2: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center"
  },

  text: {
    fontSize: 15,
    color: "white",
    fontWeight: '500'
  },
  text2: {
    fontSize: 13,
    color: "white",
  },
  touchable:{
    backgroundColor: '#9ECD3B',
    paddingVertical:9,
    paddingHorizontal:15,
    borderRadius:5,
    shadowOpacity:0.1,
    shadowColor:"black",
    shadowRadius:5
  },
  buy: {
    fontSize: 13,
    color: "white",
    fontWeight: '600',
   
  }
})