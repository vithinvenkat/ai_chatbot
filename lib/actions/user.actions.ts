"use server";

import User from "../modals/user.modal";
import {connect} from "../db";


export async function createuser(user:any) {
    try{
        await connect();
        const newUser = await User.create(user);
        return JSON.parse(JSON.stringify(newUser));
    } catch (error){
    }
}