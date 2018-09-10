import { AsyncStorage } from 'react-native';
import firebase from 'react-native-firebase';

const baseURL = 'http://localhost:5000/draw-teams/us-central1/app';
// const baseURL = 'https://us-central1-draw-teams.cloudfunctions.net/app';


export async function RegisterWithToken() {
    try {
        const idToken = await firebase.auth().currentUser.getIdToken( /* forceRefresh */ true)
        await AsyncStorage.setItem('@FirebaseToken:key', idToken);
        console.log(idToken);
    } catch (error) {
        console.error(error);
    }
};

export async function Fetch(method, url, body) {
    try {
        const token = await AsyncStorage.getItem('@FirebaseToken:key');
        if (token !== null) {
            const response = await fetch(`${baseURL}${url}`, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });
            const data = await response.json();
            console.log(data);
            return data;
        }
        return new Error('Wasn\'t able to retriebve stored token locally');
    } catch (error) {
        return error;
    }
}