import { Animated, Image, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { colors } from '../src/shared/theme/colors';

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const holdTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(splashOpacity, { toValue: 0, duration: 320, useNativeDriver: true }),
        Animated.timing(contentOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished) setShowSplash(false);
      });
    }, 2500);

    return () => clearTimeout(holdTimer);
  }, [contentOpacity, splashOpacity]);

  return (
    <SafeAreaView style={s.safe}>
      {showSplash && (
        <Animated.View style={[s.splash, { opacity: splashOpacity }]}>
          <Image source={require('../assets/logo-transparent.png')} style={s.splashLogo} />
        </Animated.View>
      )}
      <Animated.View style={[s.container, { opacity: contentOpacity }]}>
        <Image source={require('../assets/logo-transparent.png')} style={s.logo} />
        <Text style={s.eyebrow}>TODAYPICK · RECIPE ASSISTANT</Text>
        <Text style={s.title}>오늘 뭐 해먹지?</Text>
        <Text style={s.subtitle}>지금 있는 재료와 오늘의 상황을 알려주면 바로 만들 수 있는 요리를 골라드려요.</Text>
        <View style={s.cards}>
          <Entry title="재료로 찾기" text="냉장고 속 재료로 추천받기" path="/ingredients"/>
          <Entry title="테마로 찾기" text="상황에 맞는 요리 고르기" path="/themes"/>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}
function Entry({title,text,path}:{title:string;text:string;path:'/ingredients'|'/themes'}) { return <Pressable style={s.card} onPress={()=>router.push(path)}><Text style={s.cardTitle}>{title}</Text><Text style={s.muted}>{text}</Text><Text style={s.arrow}>→</Text></Pressable>; }
const s=StyleSheet.create({safe:{flex:1,backgroundColor:colors.background},splash:{...StyleSheet.absoluteFillObject,backgroundColor:colors.background,alignItems:'center',justifyContent:'center',zIndex:2},splashLogo:{width:220,height:52,resizeMode:'contain'},container:{flex:1,padding:24},logo:{width:150,height:36,resizeMode:'contain',marginBottom:55},eyebrow:{fontSize:11,letterSpacing:1.5,color:colors.primary,fontWeight:'800',marginBottom:12},title:{fontSize:38,fontWeight:'800',color:colors.ink,marginBottom:14},subtitle:{fontSize:15,lineHeight:24,color:colors.muted,marginBottom:30},cards:{gap:12},card:{backgroundColor:colors.surfaceTint,borderRadius:22,padding:20,borderWidth:1,borderColor:colors.line,shadowColor:colors.glow,shadowOpacity:0.1,shadowRadius:16,shadowOffset:{width:0,height:8}},cardTitle:{fontSize:17,fontWeight:'800',color:colors.ink,marginBottom:6},muted:{fontSize:12,color:colors.muted},arrow:{fontSize:20,alignSelf:'flex-end',color:colors.primary,marginTop:18}});
