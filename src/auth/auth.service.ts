import { Injectable } from "@nestjs/common";

@Injectable({})
export class AuthService{
    login() {
        return { msg: 'I am sign in' };
    }

    signup() {
        return {msg: 'I am sign up' };
    }
}