//import 'vueify/lib/insert-css'
import EventEditor from './vue/eventEditor.vue'
import PollEditor from './vue/pollEditor.vue'
import EventViewer from './vue/eventViewer.vue'
import VueRouter from 'vue-router'
import VueI18n from 'vue-i18n'
import BootstrapVue from 'bootstrap-vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueClipboard from 'vue-clipboard2'
import VCalendar from 'v-calendar'
const Vue = require('vue/dist/vue.common.js');
// becaue ES module vue.esm.js does not fucking work!!!
// import Vue from 'vue/dist/vue.esm.js'

const router = new VueRouter({
	mode: 'history',
	routes: [
	  {
	  	path: '/new_event',
	  	name: 'new_event',
	  	component: EventEditor
	  },
	  {
	  	path: '/event/:eventId',
	  	name: 'event',
	  	component: EventViewer,
	  	props: true
	  },
	  {
	  	path: '/event/:eventId/poll',
	  	name: 'new_poll',
	  	component: PollEditor,
			props: true
	  },
	  {
	  	path: '/poll/:pollId',
	  	name: 'edit_poll',
	  	component: PollEditor,
			props: true
	  }
  ]
});

import messages from './messages'
// importing these here because otherwise single file components (e.g. eventEditor)
// won't be able to "see" them and import. Probably an issue with vue-brunch, babel, or both
// UPDATE: fixed by having vue-brunch run before babel-brunch (via correct order in package.json)
//import 'date-fns'
// this is super annoying!!!

import messageBar from './vue/messageBar.vue'
Vue.component('message-bar', messageBar);

import ranker from './vue/ranker.vue'
Vue.component('ranker', ranker);

import eventHeader from './vue/eventHeader.vue'
Vue.component('event-header', eventHeader);

import errorPage from './vue/errorPage.vue'
Vue.component('error-page', errorPage);

Vue.use(VueI18n);
const i18n = new VueI18n({
  locale: smoodle_locale,
  messages
});

import PrettyCheckbox from 'pretty-checkbox-vue';
Vue.use(PrettyCheckbox);

Vue.use(BootstrapVue);

Vue.use(VueAxios, axios);

Vue.use(VueClipboard);

Vue.use(VCalendar, {
	locale: smoodle_locale
});

Vue.use(VueRouter);

const app = new Vue({
	i18n,
 	router
}).$mount('#app');


