<template>
    <div v-if="service && !loading">
        <p id="service_title" class="title">جزییات سرویس</p>

        <div class="row" style="margin: 0 0 12px 0;">
            <div class="service-header">

                <div class="service-name-container">
                    <img
                            :src="(service.state.toString().toLowerCase() === 'running' && !this.removing ? require('../../../components/Dashboard/home/icons/ic-service-successfull.svg') : require('../../../components/Dashboard/home/icons/ic-service-failed.svg'))"
                            :class="[service.state.toString().toLowerCase() === 'running' && !this.removing? 'success' : 'failed']">
                    <span>{{service.name}}</span>
                </div>

                <div v-if="windowWidth > 766"
                     style="width: 1px; background-color: #7c7c7c; margin-left: 12px; margin-right: 12px; border-radius: 25px"></div>
                <div class="col-xs-12" v-else
                     style="height: 1px; background-color: #7c7c7c; border-radius: 25px; margin-bottom: 12px"></div>

                <span class="service-spec">
                    نوع سرویس<br>
                    <span style="font-size: 1.2em; color: black;padding-right: .2em">{{service.service_type === 'managed'? 'Managed Service' :
                        service.service_type === 'internal'? 'Internal Service': 'External Service'}}
                    </span>
                </span>

                <span class="service-spec">
                    رم مصرفی (مگابایت)<br>
                    <span style="font-size: 1.2em; color: black;padding-right: .2em; font-family: iran-sans">{{service.memory}}</span>
                </span>

                <span class="service-spec">
                    تعداد restart<br>
                    <span style="font-size: 1.2em; color: black;padding-right: .2em; font-family: iran-sans">{{service.service_restarts}}</span>
                </span>

                <div v-if="!removing && verifyUserAccess({ADMIN: 'ADMIN', DEVELOPER: 'DEVELOPER'})"
                     class="service-edit-container">
                    <span class="service-edit"
                          @click="editService">
                        ویرایش سرویس
                    </span>
                    <span class="service-restart"
                          @click="restart">
                        راه‌اندازی مجدد
                    </span>
                    <span class="service-delete"
                          @click="remove">
                        حذف سرویس
                    </span>
                    <span class="download-service"
                          @click="downloadServiceManifest(service.name)">
                        دانلود مانیفست
                    </span>
                </div>
            </div>
        </div>


        <div class="row main" style="margin: 0;">
            <div class="box-row row col-lg-2 col-md-2 col-sm-2 col-xs-12 padding">
                <div @click="sectionClicked('detail')"
                     :class="[(activeSectionName === 'detail' ? 'enabled' : 'disabled')]">
                    <p>رپلیکاها</p>
                </div>

                <div @click="sectionClicked('env')"
                     style="font-size: 0.9em"
                     :class="[(activeSectionName === 'env' ? 'enabled' : 'disabled')]">
                    <p>Environment Variables</p>
                </div>


                <div @click="sectionClicked('domains')"
                     v-if="service.urls && service.urls.length > 0"
                     :class="[(activeSectionName === 'domains' ? 'enabled' : 'disabled')]">
                    <p>دامنه‌ها</p>
                </div>

                <div @click="sectionClicked('monitor')"
                     :class="[(activeSectionName === 'monitor' ? 'enabled' : 'disabled')]">
                    <p>مانیتورینگ</p>
                </div>

                <div @click="sectionClicked('logs')"
                     :class="[(activeSectionName === 'logs' ? 'enabled' : 'disabled')]">
                    <p>لاگ‌ها</p>
                </div>

                <div v-if="verifyUserAccess({ADMIN: 'ADMIN', DEVELOPER: 'DEVELOPER'})"
                     @click="sectionClicked('rollback')"
                     :class="[(activeSectionName === 'rollback' ? 'enabled' : 'disabled')]">
                    <p>کپسول زمان</p>
                </div>

                <div v-if="verifyUserAccess({ADMIN: 'ADMIN', DEVELOPER: 'DEVELOPER'})"
                     class="action-divider">
                    <p>عملیات سرویس</p>
                </div>

                <div v-if="verifyUserAccess({ADMIN: 'ADMIN', DEVELOPER: 'DEVELOPER'})" @click="editService"
                     class="edit-service">
                    <p>ویرایش سرویس</p>
                </div>

                <div v-if="verifyUserAccess({ADMIN: 'ADMIN', DEVELOPER: 'DEVELOPER'})" @click="remove"
                     class="delete-service">
                    <p>حذف سرویس</p>
                </div>

                <div v-if="verifyUserAccess({ADMIN: 'ADMIN', DEVELOPER: 'DEVELOPER'})" @click="restart"
                     class="restart-service">
                    <p>راه‌اندازی مجدد</p>
                </div>

                <div v-if="verifyUserAccess({ADMIN: 'ADMIN', DEVELOPER: 'DEVELOPER', OPERATOR:'OPERATOR'})"
                     @click="downloadServiceManifest(service.name)"
                     class="download-service">
                    <p>دانلود مانیفست</p>
                </div>
            </div>

            <keep-alive>
                <component class="col-lg-10 col-md-10 col-xs-12 col-sm-10 padding"
                           v-bind:is="activeSectionName"
                           style="padding: 0"
                           :service="service">

                </component>
            </keep-alive>
        </div>
    </div>
</template>

<script>
    import FInput from "~/components/elements/input";
    import FButton from "~/components/elements/button";
    import File from "~/components/elements/file";
    import FLabelDisable from "~/components/elements/label/label-disable";

    import FCollaps from "~/components/elements/collaps";
    import FReplicaHeader from "~/components/Dashboard/replica/header";
    import FReplicaDetails from "~/components/Dashboard/replica/details";
    import FReplicaContainers from "~/components/Dashboard/replica/containers";
    import FReplicaEvents from "~/components/Dashboard/replica/events";
    import detail from "./service/detail"
    import monitor from "./service/monitor"
    import env from "./service/env"
    import domains from "./service/domains"
    import logs from "./service/logs"
    import rollback from "./service/rollback"
    import ErrorReporter from "../../../utils/ErrorReporter";
    import RoleAccessHandler from "../../../utils/RoleAccessHandler";
    import * as yaml from "js-yaml";

    export default {
        layout: "dashboard",
        components: {
            FReplicaEvents,
            FReplicaContainers,
            FReplicaHeader,
            FReplicaDetails,
            FCollaps,
            FInput,
            FButton,
            File,
            FLabelDisable,
            detail,
            monitor,
            env,
            domains,
            logs,
            rollback
        },
        data() {
            return {
                removing: false,
                activeSectionName: 'detail',
                service_name: '',
                image: this.$route.params.image,
                manifest: Object
            };
        },
        created() {
            this.$store.commit("SET_DATA", {id: "manifest", data: {}});
            this.service_name = this.$route.params.id;
            this.getData();
        },
        methods: {
            restart() {
                this.$ga.event({
                    eventCategory: "service",
                    eventAction: "click btn restart service",
                    eventLabel: "service name",
                    eventValue: this.service_name
                });
                this.$alertify(
                    {
                        title: `راه‌اندازی مجدد سرویس`,
                        img: require("../../../components/Dashboard/alert/images/ic_restart.svg"),
                        description: `آیا از راه‌اندازی مجدد ${this.service_name}  مطمئن هستید؟`,
                        label: 'تایید راه‌اندازی مجدد'
                    },
                    status => {
                        if (status) {
                            // this.$store.commit("SET_DATA", {data: true, id: "loading"});
                            this.$store.dispatch("performServiceAction", {
                                service_name: this.service_name,
                                service_action: 'RESTART'
                            })
                                .then(res => {
                                    this.$store.commit("SET_DATA", {data: false, id: "loading"});
                                    location.reload()
                                    this.$ga.event({
                                        eventCategory: "service",
                                        eventAction: "restart service",
                                        eventLabel: "service name",
                                        eventValue: this.service_name
                                    });
                                    this.$notify({
                                        title: res.message,
                                        type: "success"
                                    });
                                })
                                .catch(e => {
                                    this.$store.commit("SET_DATA", {data: false, id: "loading"});
                                    this.$ga.event({
                                        eventCategory: "service",
                                        eventAction: "fail restarting service",
                                        eventLabel: "service name",
                                        eventValue: this.service_name
                                    });
                                    this.$notify({
                                        title: e.data.message,
                                        type: "error"
                                    });
                                });

                        }
                    }
                );
            },
            verifyUserAccess(permitted_roles) {
                return RoleAccessHandler(permitted_roles)
            },
            editService() {
                if (this.service.service_type === 'managed') {
                    this.dumpManifest(this.service.name)
                } else {
                    this.$router.push({
                        path: '/dashboard/services/wizard',
                        query: {service: this.service_name, ns: this.$route.query.ns}
                    })
                }
            },
            remove() {
                this.$ga.event({
                    eventCategory: "service",
                    eventAction: "click btn remove service",
                    eventLabel: "service name",
                    eventValue: this.service_name
                });
                this.$alertify(
                    {
                        title: `حذف سرویس`,
                        description: `آیا از حذف ${this.service_name}  مطمئن هستید؟`
                    },
                    status => {
                        if (status) {
                            // this.$store.commit("SET_DATA", {data: true, id: "loading"});
                            this.$store.dispatch("deleteService", this.service_name)
                                .then(res => {
                                    this.$store.commit("SET_DATA", {data: false, id: "loading"});
                                    this.$router.replace({path: '/dashboard/services'});
                                    this.$ga.event({
                                        eventCategory: "service",
                                        eventAction: "remove service",
                                        eventLabel: "service name",
                                        eventValue: this.service_name
                                    });
                                    this.$notify({
                                        title: res.message,
                                        type: "success"
                                    });
                                })
                                .catch(e => {
                                    this.$store.commit("SET_DATA", {data: false, id: "loading"});
                                    this.$ga.event({
                                        eventCategory: "service",
                                        eventAction: "fail remove service",
                                        eventLabel: "service name",
                                        eventValue: this.service_name
                                    });
                                    this.$notify({
                                        title: e.data.message,
                                        type: "error"
                                    });
                                });
                            this.removing = true;
                            this.getData()
                        }
                    }
                );
            },
            async getData() {
                try {
                    let res = await this.$store.dispatch("getServicesName", {
                        name: this.service_name
                    });
                    let internal = null;
                    if (res.state !== "RUNNING" || this.removing) {
                        setTimeout(() => {
                            this.getData();
                        }, this.removing ? 1000 : 5000);
                    } else {
                        clearInterval(internal);
                    }
                    this.$store.commit("SET_DATA", {data: false, id: "loading"});
                } catch (e) {
                    this.$store.commit("SET_DATA", {data: false, id: "loading"});
                    if (e.status === 401) {
                        this.$router.push("/user/login");
                    } else {
                        this.$router.push({path: "/dashboard/services"})
                    }
                }
            },
            async downloadServiceManifest(service_name) {
                this.$store.commit("SET_DATA", {data: true, id: "loading"});
                await this.$store.dispatch('dumpServiceManifest', service_name)
                    .then(response => {
                        this.$store.commit("SET_DATA", {data: false, id: "loading"});
                        var fileURL = window.URL.createObjectURL(new Blob([yaml.dump(response, {'sortKeys': true})]));
                        var fileLink = document.createElement('a');
                        fileLink.href = fileURL;
                        fileLink.setAttribute('download', `${service_name}-manifest.yml`);
                        document.body.appendChild(fileLink);
                        fileLink.click();
                    }).catch(e => {
                        this.$store.commit("SET_DATA", {data: false, id: "loading"});
                        if (e.status === 401) {
                            this.$router.push("/user/login");
                        } else {
                            ErrorReporter(e, this.$data, true).forEach(error => {
                                this.$notify({
                                    title: error,
                                    time: 4000,
                                    type: "error"
                                });
                            });
                        }
                    });
            },
            async dumpManifest(service_name) {
                this.$store.commit("SET_DATA", {data: true, id: "loading"});
                await this.$store.dispatch('dumpServiceManifest', service_name)
                    .then(response => {
                        this.$store.commit("SET_DATA", {data: false, id: "loading"});

                        let service_name = JSON.parse(localStorage.getItem('vuex')).manifest.spec.service_name;
                        this.$store.commit("SET_JSON_MANIFEST", {});

                        this.$router.push({
                            path: '/dashboard/services/managed-service-setup',
                            query: {service: service_name, service_name: this.service.name}
                        })


                    }).catch(e => {
                        this.$store.commit("SET_DATA", {data: false, id: "loading"});
                        if (e.status === 401) {
                            this.$router.push("/user/login");
                        } else {
                            ErrorReporter(e, this.$data, true).forEach(error => {
                                this.$notify({
                                    title: error,
                                    time: 4000,
                                    type: "error"
                                });
                            });
                        }
                    })
            },
            sectionClicked(sectionName) {
                this.activeSectionName = sectionName;
            },
        },
        destroyed() {
            this.$store.commit("SET_DATA", {data: null, id: "service"});
        },
        computed: {
            loading() {
                return this.$store.state.loading;
            },
            windowWidth() {
                return this.$store.state.windowWidth;
            },
            service() {
                return this.$store.state.service;
            }
        }
    };
</script>

<style scoped lang="stylus">

    @import '../../../assets/css/variables.styl'

    .title
        font-family iran-yekan !important
        font-style normal !important
        font-weight bold !important
        font-size 1.2em !important
        font-stretch normal !important
        line-height 1.75 !important
        color #7c7c7c !important
        letter-spacing normal !important

    .box
        padding 16px
        box-sizing content-box
        @media only screen and (max-width: 766px)
            border-radius 3px
            box-shadow 0 2px 6px 0 rgba(0, 0, 0, 0.07)
            background-color #ffffff


    .box-row
        height fit-content
        margin-left 0
        margin-right 0
        display block
        white-space nowrap
        overflow-x scroll
        overflow-y scroll
        -ms-overflow-style none
        scrollbar-width none
        @media only screen and (max-width: 766px)
            border-radius 3px
            box-shadow 0 2px 6px 0 rgba(0, 0, 0, 0.07)
            background-color #fefefe
            overflow-x scroll
            overflow-y hidden
            margin-bottom 12px
            margin-top 0

        div.disabled
            padding 0
            cursor pointer
            @media only screen and (max-width: 766px)
                margin-right: -5px
                display: inline-flex

            p
                font-style normal
                font-stretch normal
                line-height 40px
                text-align center
                font-family iran-yekan
                background-color #fefefe
                border-radius 3px
                box-shadow 0 2px 6px 0 rgba(0, 0, 0, 0.03)
                font-size .9em
                outline none
                margin-top 0
                font-weight normal
                margin-bottom 8px
                letter-spacing normal
                color #000000
                @media only screen and (max-width: 766px)
                    min-width 200px
                    border-left: 1px solid #0045ff
                    border-radius 0
                    box-shadow none
                    font-size 1em
                    line-height 32px
                    margin-top 8px
                    margin-bottom 8px
                    background-color transparent


        div.enabled
            padding 0
            cursor pointer
            @media only screen and (max-width: 766px)
                background-color #0045ff
                margin-right: -1px
                display: inline-flex

            p
                font-style normal
                font-stretch normal
                line-height 40px
                text-align center
                font-family iran-yekan
                font-weight bold
                font-size .9em
                background-color #0045ff
                border-radius 3px
                box-shadow 0 2px 6px 0 rgba(41, 121, 255, 0.2)
                outline none
                margin-top 0
                margin-bottom 8px
                letter-spacing normal
                color #ffffff
                @media only screen and (max-width: 766px)
                    min-width 200px
                    border-radius 0
                    box-shadow none
                    line-height 32px
                    font-size 1em
                    margin-top 8px
                    margin-bottom 8px
                    background-color transparent

        div.edit-service
            padding 0
            cursor pointer
            @media only screen and (max-width: 766px)
                margin-right: -1px
                display: none

            p
                font-style normal
                font-stretch normal
                line-height 40px
                text-align center
                font-family iran-yekan
                font-weight normal
                font-size .9em
                background-color $greenLight
                border-radius 3px
                box-shadow 0 2px 6px 0 rgba(41, 121, 255, 0.2)
                outline none
                margin-top 0
                margin-bottom 8px
                letter-spacing normal
                color #fefefe

        div.delete-service
            padding 0
            cursor pointer
            @media only screen and (max-width: 766px)
                margin-right: -1px
                display: none

            p
                font-style normal
                font-stretch normal
                line-height 40px
                text-align center
                font-family iran-yekan
                font-weight normal
                font-size .9em
                background-color $red
                border-radius 3px
                box-shadow 0 2px 6px 0 rgba(41, 121, 255, 0.2)
                outline none
                margin-top 0
                margin-bottom 8px
                letter-spacing normal
                color #fefefe

        div.action-divider
            padding 0
            margin-top 24px
            @media only screen and (max-width: 766px)
                margin-right: -1px
                display: none

            p
                font-style normal
                font-stretch normal
                line-height 40px
                text-align center
                font-family iran-yekan
                font-weight bold
                font-size .9em
                outline none
                margin-top 0
                margin-bottom 8px
                border-bottom 1px solid #3c3c3c
                letter-spacing normal
                color #3c3c3c

        div.restart-service
            padding 0
            cursor pointer
            @media only screen and (max-width: 766px)
                margin-right: -1px
                display: none

            p
                font-style normal
                font-stretch normal
                line-height 40px
                text-align center
                font-family iran-yekan
                font-weight normal
                font-size .9em
                background-color $colorAccent
                border-radius 3px
                box-shadow 0 2px 6px 0 rgba(41, 121, 255, 0.2)
                outline none
                margin-top 0
                margin-bottom 8px
                letter-spacing normal
                color $fontGray

        div.download-service
            padding 0
            cursor pointer
            @media only screen and (max-width: 766px)
                margin-right: -1px
                display: none

            p
                font-style normal
                font-stretch normal
                line-height 40px
                text-align center
                font-family iran-yekan
                font-weight normal
                font-size .9em
                background-color $colorPrimary
                border-radius 3px
                box-shadow 0 2px 6px 0 rgba(41, 121, 255, 0.2)
                outline none
                margin-top 0
                margin-bottom 8px
                letter-spacing normal
                color $totalWhite


    .box-row::-webkit-scrollbar
        display none

    .service-header
        padding 16px
        background-color #fefefe
        border-radius 3px
        box-shadow 0 2px 6px 0 rgba(0, 0, 0, 0.07)
        min-height 64px
        width 100%
        display flex
        margin 0
        @media only screen and (max-width: 766px)
            display block

        .service-name-container
            display flex
            overflow auto
            box-sizing border-box
            max-width 550px
            @media only screen and (max-width: 766px)
                display block

            span
                margin-top auto
                margin-bottom auto
                font-size 1.5em
                font-family iran-yekan
                width 100%
                font-weight bold
                text-align center
                display inline-block
                padding-right 16px
                padding-left 16px
                white-space nowrap
                overflow hidden
                text-overflow ellipsis
                @media only screen and (max-width: 766px)
                    font-size 1.8em
                    padding-bottom 12px
                    display inline-block
                    padding-right 0
                    padding-left 0
                    margin-top 12px

            img
                border-radius 100px
                width 30px
                height 30px
                display inline-flex
                margin-left 7px
                margin-top auto
                margin-bottom auto
                @media only screen and (max-width: 766px)
                    display block
                    margin-left auto
                    margin-right auto
                    margin-bottom 16

                &.success
                    animation rotating 5s infinite linear
                    -webkit-animation rotating 5s infinite linear
                    -moz-animation rotating 5s infinite linear
                    -o-animation rotating 5s infinite linear
                    -ms-animation rotating 5s infinite linear

                &.failed
                    animation broken-rotating 1.5s infinite linear
                    -webkit-animation broken-rotating 1.5s infinite linear
                    -moz-animation broken-rotating 1.5s infinite linear
                    -o-animation broken-rotating 1.5s infinite linear
                    -ms-animation broken-rotating 1.5s infinite linear


        @-webkit-keyframes rotating {
            from {
                -webkit-transform: rotate(0deg);
            }
            to {
                -webkit-transform: rotate(360deg);
            }
        }
        @keyframes rotating {
            from {
                -webkit-transform: rotate(0deg);
            }
            to {
                -webkit-transform: rotate(360deg);
            }
        }

        @-webkit-keyframes broken-rotating {

            0% {
                -webkit-transform: rotate(0deg);
            }
            10% {
                -webkit-transform: rotate(4deg);
            }
            20% {
                -webkit-transform: rotate(8deg);
            }
            30% {
                -webkit-transform: rotate(12deg);
            }
            40% {
                -webkit-transform: rotate(16deg);
            }
            50% {
                -webkit-transform: rotate(20deg);
            }
            60% {
                -webkit-transform: rotate(16deg);
            }
            70% {
                -webkit-transform: rotate(12deg);
            }
            80% {
                -webkit-transform: rotate(8deg);
            }
            90% {
                -webkit-transform: rotate(4deg);
            }
            100% {
                -webkit-transform: rotate(0deg);
            }
        }
        @keyframes broken-rotating {

            0% {
                -webkit-transform: rotate(0deg);
            }
            10% {
                -webkit-transform: rotate(4deg);
            }
            20% {
                -webkit-transform: rotate(8deg);
            }
            30% {
                -webkit-transform: rotate(12deg);
            }
            40% {
                -webkit-transform: rotate(16deg);
            }
            50% {
                -webkit-transform: rotate(20deg);
            }
            60% {
                -webkit-transform: rotate(16deg);
            }
            70% {
                -webkit-transform: rotate(12deg);
            }
            80% {
                -webkit-transform: rotate(8deg);
            }
            90% {
                -webkit-transform: rotate(4deg);
            }
            100% {
                -webkit-transform: rotate(0deg);
            }
        }


    .service-edit-container
        margin-top 16px
        display block
        overflow-y hidden
        overflow-x scroll
        @media only screen and (min-width 772px)
            display none

    .service-edit
        display inline-block
        color $totalWhite
        line-height 1.75
        margin-bottom auto
        font-size 1.2em
        font-family iran-yekan
        font-weight normal
        background-color $greenLight
        border-radius 3px
        text-align center
        align-self start
        padding 8px 24px
        margin-top 0
        cursor pointer

    .service-restart
        display inline-block
        color $fontGray
        line-height 1.75
        margin-bottom auto
        font-size 1.2em
        font-family iran-yekan
        font-weight normal
        background-color $colorAccent
        border-radius 3px
        text-align center
        align-self start
        padding 8px 24px
        margin-top 0
        cursor pointer

    span.download-service
        font-style normal
        background-color $colorPrimary
        outline none
        letter-spacing normal
        color $totalWhite
        display inline-block
        line-height 1.75
        margin-bottom auto
        font-size 1.2em
        font-family iran-yekan
        font-weight normal
        border-radius 3px
        text-align center
        align-self start
        padding 8px 24px
        margin-top 0
        cursor pointer

    .service-delete
        display inline-block
        color $totalWhite
        line-height 1.75
        font-size 1.2em
        font-family iran-yekan
        font-weight normal
        background-color $red
        border-radius 3px
        text-align center
        align-self start
        padding 8px 24px
        margin-top 0
        cursor pointer


    .service-spec
        color #7c7c7c
        line-height 1.75
        margin-top auto
        margin-bottom auto
        font-size 1em
        font-family iran-yekan
        font-weight normal
        text-align center
        padding-left 24px
        padding-right 24px
        display inline-block
        @media only screen and (max-width: 766px)
            font-size 1.2em
            display block
            margin-top 8px
            padding-right 0
            padding-left 0


    .main
        div.padding
            padding-right 0
            padding-left 12px
            @media only screen and (max-width: 766px)
                padding 0


</style>
