import { getToken } from "../utils/cookie";

export default async function({ req, isServer, redirect, route }) {
  if (route.path.includes("dashboard") || route.path.startsWith("/dashboard")) {
    if (!getToken()) {
      redirect("/user/login");
    }
  }

  // if(isServer){
  //   if(!req.cookies['USER_TOKEN']){
  //     redirect('/user/login')
  //   }
  // } else {
  //   if(!getToken()){
  //     redirect('/user/login')
  //   }
  // }
}
