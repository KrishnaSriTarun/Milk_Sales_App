//Authentication
export const  LOGIN: string = '/api/v0.1/login';
export const REGISTER_USER:string='/api/v0.1/register';

//Rate
export const  GET_RATE: string = '/api/v0.1/getRate';
export const UPDATE_RATE:string='/api/v0.1/updateRate';

//User Data
export const  GET_USER: string = '/api/v0.1/user';

//Supply Data
export const  GET_SUPPLY_DATA: string = '/api/v0.1/Supply';
export const  POST_SUPPLY_DATA: string = '/api/v0.1/Supply/add';
export const  POST_SUPPLY_SPECIAL_DATA: string = '/api/v0.1/Supply/addSpecial';
export const  GET_SUPPLY_BY_RANGE: string = '/api/v0.1/Supply/Range';
export const  DELETE_SUPPLY: string = '/api/v0.1/Supply';
export const  UPDATE_SUPPLY_STATUS: string = '/api/v0.1/Supply/markCompleted';