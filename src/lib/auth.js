import React  from 'react';
import {connect, Provider} from 'react-redux';
import { Route} from 'react-router-dom'
import POST   from './post';
import packageJSON from '../package.json';

const appName = packageJSON.name;

const providers = packageJSON.authProviders
// From the Applicatuion  state persepctive
// the auth state will be in auth
// - {auth: {...here...}}
//because we will be using [combineReducers] in index.js

const defaults = {
  verified:false, //the auth token was confirmed valid by the server 
  progress:false, //the current auth-action being executed (check,signin,signup,....)
  user:false,      //the user information we got from the server 
  token:false //the JWT token
};

const save = state => {
localStorage.setItem(`${appName}-auth`,JSON.stringify({
    token:state.token,
    user: state.user

}))};

//this loads out auth state from localStorage
// - if localStorage hs a record, this will be JSON.parsed
// - if notl,'{}' will return an empty object
// - for the return the order of ...splashes is important 
// we take defaults first , and then try to overwrite with the 
// loaded state 
const load = () => {
    const loaded = JSON.parse( localStorage.getItem(`${appName}-auth`) || '{}')
    return {...defaults,...loaded};
    } 

const preloadedState = load();

export const authReducer = function(state = preloadedState, action) {
    switch (action.type) {
        case "auth:login":
        window.location =`${packageJSON.backend}/auth/${action.provider}`;  break;

        case "auth:logout": 
        state = {...state ,user:false ,token:false ,verified:false }; break;

        case "auth:check":
        state = {...state ,progress:'checking'}; break;

        case "auth:ok":
        state = {...state ,token:false ,progress:false ,verified:true}; 
        POST.token= action.token;
        break;

        case "auth:fail":
        state = {...state ,token:false ,progress:false ,user:false ,error:action.error ,verified:false};
        POST.token= false;
        break;
        default:
        
    }
    save(state);
    return state
}

export const authActinos = function (dispatch) {
    return { auth:{
        login:async function (provider) { 
            dispatch({type:'auth:login',provider})
        },
        ok:async function (token) { 
            dispatch({type:'auth:ok',token})
        },
        check:async function (token) { 
            dispatch({type:'auth:check',token})
            POST.token = token;
            const result = await POST('/auth/check');
            if (result.success){
                dispatch ({type:'auth:ok', token})
            } else {
                dispatch({type:'auth:fail',error:result.message})
            }
        },
        fail:async function (error) { 
            dispatch({type:'auth:fail',error})
        },
        logout:async function () { 
            dispatch({type:'auth:fail'})
        }
    }}}
    
    const AuthSuccess = connect (null ,authActinos)(
            function AuthSuccess(props){
                const {auth} =props;
                const token =props.match.params.token;
                auth.ok(token)
                props.history.push('/')
                return null;
            }
            )
    let checkedForTokenAlready = false;

    const AuthCheck = connect(null, authActinos)(
        function AuthCheck({auth}) {
            if (checkedForTokenAlready) return null;
            if (preloadedState.token) auth.check(preloadedState.token)
            checkedForTokenAlready = true;
            return null;
            
        }
    )
            
  export  function Auth() {
        return( <>
        <AuthCheck />
        <Route path= "/success/:token" component={AuthSuccess}/>
            </>
        )
    }
            
    export function AuthLinks() {
        return providers.map(
        Provider =>
            <div className="parent"><a href={`${packageJSON.backend}/auth/${Provider}`}>Login with {Provider}</a></div>
        )
    }
            
            
            