
// androidClientId:"509817826228-51cqafe5tsrb5404i4c7f4it3f3must9.apps.googleusercontent.com",
// iosClientId:"509817826228-bi3hm4j0m7bcp8hj9c3ttmkc5n691r7t.apps.googleusercontent.com",
// expoClientId:"509817826228-63e15jn26ddu0a6t1usmufhlpp91dbo7.apps.googleusercontent.com"


import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, Button, Platform } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';



export default function LoginAuthetication() {
    const [userInfo, setUserInfo] = useState();
    const [auth, setAuth] = useState();
    const [requireRefresh, setRequireRefresh] = useState(false);

    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: "509817826228-51cqafe5tsrb5404i4c7f4it3f3must9.apps.googleusercontent.com",
        iosClientId: "509817826228-bi3hm4j0m7bcp8hj9c3ttmkc5n691r7t.apps.googleusercontent.com",
        expoClientId: "509817826228-63e15jn26ddu0a6t1usmufhlpp91dbo7.apps.googleusercontent.com"
    });

    useEffect(() => {
        console.log(response);
        if (response?.type === "success") {
            setAuth(response.authentication);

            const persistAuth = async () => {
                await AsyncStorage.setItem("auth", JSON.stringify(response.authentication));
            };
            persistAuth();
        }
    }, [response]);

    useEffect(() => {
        const getPersistedAuth = async () => {
            const jsonValue = await AsyncStorage.getItem("auth");
            if (jsonValue != null) {
                const authFromJson = JSON.parse(jsonValue);
                setAuth(authFromJson);
                console.log(authFromJson);

                setRequireRefresh(!AuthSession.TokenResponse.isTokenFresh({
                    expiresIn: authFromJson.expiresIn,
                    issuedAt: authFromJson.issuedAt
                }));
            }
        };
        getPersistedAuth();
    }, []);

    const getUserData = async () => {
        let userInfoResponse = await fetch("https://www.googleapis.com/userinfo/v2/me", {
            headers: { Authorization: `Bearer ${auth.accessToken}` }
        });

        userInfoResponse.json().then(data => {
            console.log(data);
            setUserInfo(data);
        });
    };

    const showUserData = () => {
        if (userInfo) {
            return (
                <View style={styles.userInfo}>
                    <Image source={{ uri: userInfo.picture }} style={styles.profilePic} />
                    <Text>Welcome {userInfo.name}</Text>
                    <Text>{userInfo.email}</Text>
                </View>
            );
        }
    };

    
 

    const logout = async () => {
        await AuthSession.revokeAsync({
            token: auth.accessToken
        }, {
            revocationEndpoint: "https://oauth2.googleapis.com/revoke"
        });

        setAuth(undefined);
        setUserInfo(undefined);
        await AsyncStorage.removeItem("auth");
    };

    return (
        <View style={styles.container}>
            {showUserData()}
            <Button
            color={'black'}
                title={auth ? "Get User Data" : "Login"}
                onPress={auth ? getUserData : () => promptAsync({ useProxy: true, showInRecents: true })}
            />
            {auth ? <Button title="Logout" onPress={logout} color={'red'}/> : undefined}
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap:10,
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profilePic: {
        width: 50,
        height: 50
    },
    userInfo: {
        alignItems: 'center',
        justifyContent: 'center'
    }
});


// is mahine ke ikk din ke paise