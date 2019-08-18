import Vuex from "vuex";
import * as actions from "./actions";
import * as mutations from "./mutations";
import wizard from "./wizard";
import plan from "./plan";
import dashboard from "./dashboard";
const createStore = () => {
  return new Vuex.Store({
    state: () => {
      return {
        isNativeMenus: null,
        sideMunu: true,
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
        account: {},
        activePlan: {},
        transactionDetail: {}
      };
    },
    actions: actions,
    mutations: mutations,
    modules: {
      dashboard,
      wizard,
      plan
    }
  });
};

export default createStore;
