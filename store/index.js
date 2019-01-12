import Vuex from "vuex";
import * as actions from "./actions";
import * as mutations from "./mutations";
import wizard from "./wizard";
import plan from "./plan";
const createStore = () => {
  return new Vuex.Store({
    state: () => {
      return {
        windowHeight: null,
        windowWidth: null,
        sidebar: "halfSidebar",
        modals: {
          login: false,
          register: false,
          forgot_password: false,
          message: false,
          recovery: false
        },
        loading: true,
        message: "",
        progress: 0,
        services: null,
        service: null,
        serviceLog: null,
        user: {
          token: null
        },
        images: null,
        versions: null,
        builds: null,
        domains: null,
        domain: null,
        secrets: null,
        manifest: {},
        account: {}
      };
    },
    actions: actions,
    mutations: mutations,
    modules: {
      wizard,
      plan
    }
  });
};

export default createStore;
