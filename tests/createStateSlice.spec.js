const chai = require('chai');
const { expect } = chai;
const should = chai.should();
const { createStore, combineReducers } = require('redux');
const api = require('./api.test');

const { createStateSlice } = require('../build/index.min.js');

describe('createStateSlice', () => {
    describe('passing one synchronous (by default) action named logout for ' +
    'session slice', () => {
        const { actions } = createStateSlice({
            namespace : 'session',
            actions : { logout : { } }
        });

        it('should return an object with actions defined', () => {
            actions.should.be.an('object');
        });

        it('should return an action constant of session/LOGOUT', () => {
            expect(actions.LOGOUT).to.equal('session/LOGOUT');
        });

        it('should return a logout method which defaults to empty payload and ' +
        'type of session/LOGOUT', () => {
            actions.logout.should.be.a('function');
            const logoutResult = actions.logout();
            console.log('logoutResult ->', logoutResult);
            logoutResult.type.should.equal('session/LOGOUT');
            expect(logoutResult.payload).to.equal(undefined);
        });
    });

    describe('passing one asynchronous set of actions prefixed "login" for ' +
    'session slice', () => {
        const { actions } = createStateSlice({
            namespace : 'session',
            actions : { login : {
                isAsync : true,
                requestHandler : api.login
            } }
        });

        it('should return an action constants for session/LOGIN_REQUEST, ' +
        'session/LOGIN_SUCCESS and session/LOGIN_ERROR', () => {
            expect(actions.LOGIN_REQUEST).to.equal('session/LOGIN_REQUEST');
            expect(actions.LOGIN_SUCCESS).to.equal('session/LOGIN_SUCCESS');
            expect(actions.LOGIN_ERROR).to.equal('session/LOGIN_ERROR');
        });

        it('should return a function for request the handler', () => {
            expect(typeof actions.loginRequest).to.equal('function');
        });
    });

    describe('testing login, logout and error actions against a reducer created by ' +
    'createStateSlice', () => {
        const { actions, reducer } = createStateSlice({
            namespace : 'session',
            actions : {
                login : { isAsync : true, requestHandler : api.login },
                logout : { isAsync : false }
            }
        });

        it('should return a reducer', () => {
            expect(reducer).to.be.a('function');
        });
    });
});
