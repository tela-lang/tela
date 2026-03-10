
const GlobalStore = Tela.defineComponent({
  name: 'GlobalStore',
  
  
  setup(instance) {
    const state_GlobalStore = Tela.reactive({
      storeBasicCode: "",
      storeExportCode: "",
      storeMultiCode: ""
    }, instance.update, {});

    

    

    

    

    

    // onMount
    state_GlobalStore.storeBasicCode = window.TELA_DOCS.storeBasicCode;
      state_GlobalStore.storeExportCode = window.TELA_DOCS.storeExportCode;
      state_GlobalStore.storeMultiCode = window.TELA_DOCS.storeMultiComponent;

    return () => {
      
      return Tela.element('div', {  }, [Tela.element('h1', { 'class': "tela-GlobalStore-h1-0" }, ["Global Store"]), Tela.element('div', { 'class': "tela-GlobalStore-div-1" }, [""]), Tela.element('p', { 'class': "tela-GlobalStore-p-2" }, ["The store keyword declares shared reactive state that lives outside any component. Any component in the same file — or any file that imports it — can read and write to it directly."]), Tela.element('h2', { 'class': "tela-GlobalStore-h2-3" }, ["Basic example"]), Tela.element('p', { 'class': "tela-GlobalStore-p-4" }, ["Declare a store at the top of a .tela file, then reference its fields in any component. The compiler auto-wires subscriptions."]), Tela.element('div', { 'class': "tela-GlobalStore-div-5" }, [Tela.element('pre', { 'class': "tela-GlobalStore-pre-6" }, [Tela.element('code', { 'class': "language-tela" }, [`${state_GlobalStore.storeBasicCode}`])])]), Tela.element('h2', { 'class': "tela-GlobalStore-h2-7" }, ["How it works"]), Tela.element('div', { 'class': "tela-GlobalStore-div-8" }, [Tela.element('div', { 'class': "tela-GlobalStore-div-9" }, [Tela.element('div', { 'class': "tela-GlobalStore-div-10" }, ["1"]), Tela.element('div', {  }, [Tela.element('div', { 'class': "tela-GlobalStore-div-11" }, ["Shared across components"]), Tela.element('div', { 'class': "tela-GlobalStore-div-12" }, ["Any component that reads or writes a store field is automatically subscribed. You never pass the store as a prop."])])]), Tela.element('div', { 'class': "tela-GlobalStore-div-13" }, [Tela.element('div', { 'class': "tela-GlobalStore-div-14" }, ["2"]), Tela.element('div', {  }, [Tela.element('div', { 'class': "tela-GlobalStore-div-15" }, ["Auto-subscribed by the compiler"]), Tela.element('div', { 'class': "tela-GlobalStore-div-16" }, ["The compiler scans each component for store references and emits Tela.subscribeStore() in setup and Tela.unsubscribeStore() in onDestroy. No manual wiring."])])]), Tela.element('div', { 'class': "tela-GlobalStore-div-17" }, [Tela.element('div', { 'class': "tela-GlobalStore-div-18" }, ["3"]), Tela.element('div', {  }, [Tela.element('div', { 'class': "tela-GlobalStore-div-19" }, ["Batched updates"]), Tela.element('div', { 'class': "tela-GlobalStore-div-20" }, ["Multiple writes to the same store in one event handler fire only one re-render pass across all subscribing components, via a microtask flush."])])])]), Tela.element('h2', { 'class': "tela-GlobalStore-h2-21" }, ["Multiple components sharing a store"]), Tela.element('p', { 'class': "tela-GlobalStore-p-22" }, ["All subscribing components re-render whenever the store changes. Here, CartBadge and AddToCart both react to CartStore without any prop drilling."]), Tela.element('div', { 'class': "tela-GlobalStore-div-23" }, [Tela.element('pre', { 'class': "tela-GlobalStore-pre-24" }, [Tela.element('code', { 'class': "language-tela" }, [`${state_GlobalStore.storeMultiCode}`])])]), Tela.element('h2', { 'class': "tela-GlobalStore-h2-25" }, ["Exporting a store"]), Tela.element('p', { 'class': "tela-GlobalStore-p-26" }, ["Prefix with export to make a store importable from other files, the same way you export a component."]), Tela.element('div', { 'class': "tela-GlobalStore-div-27" }, [Tela.element('pre', { 'class': "tela-GlobalStore-pre-28" }, [Tela.element('code', { 'class': "language-tela" }, [`${state_GlobalStore.storeExportCode}`])])]), Tela.element('div', { 'class': "tela-GlobalStore-div-29" }, [Tela.element('div', { 'class': "tela-GlobalStore-div-30" }, ["Writing to a store"]), Tela.element('div', { 'class': "tela-GlobalStore-div-31" }, ["Store fields are written as plain member assignment: AppStore.count = AppStore.count + 1. No setter methods or dispatch functions needed."])])]);
    };
  }
});

(function(){
  if (typeof window !== 'undefined') {
    window.GlobalStore = GlobalStore;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GlobalStore };
  }
})();