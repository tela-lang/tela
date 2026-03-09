
const ComponentAnatomy = Tela.defineComponent({
  name: 'ComponentAnatomy',
  
  
  setup(instance) {
    const state_ComponentAnatomy = Tela.reactive({
      anatomyCode: ""
    }, instance.update, {});

    

    

    

    // onMount
    state_ComponentAnatomy.anatomyCode = window.TELA_DOCS.anatomyCode;

    return () => {
      
      return Tela.element('div', {  }, [Tela.element('h1', { 'class': "tela-ComponentAnatomy-h1-0" }, ["Component Anatomy"]), Tela.element('div', { 'class': "tela-ComponentAnatomy-div-1" }, [""]), Tela.element('p', { 'class': "tela-ComponentAnatomy-p-2" }, ["Every Tela component lives in a single .tela file. It contains five sections: state, props, functions, lifecycle hooks, and the view."]), Tela.element('h2', { 'class': "tela-ComponentAnatomy-h2-3" }, ["A Complete Component"]), Tela.element('p', { 'class': "tela-ComponentAnatomy-p-4" }, ["Here is a counter component showing all five parts in action:"]), Tela.element('div', { 'class': "tela-ComponentAnatomy-div-5" }, [Tela.element('pre', { 'class': "tela-ComponentAnatomy-pre-6" }, [Tela.element('code', { 'class': "language-tela" }, [`${state_ComponentAnatomy.anatomyCode}`])])]), Tela.element('h2', { 'class': "tela-ComponentAnatomy-h2-7" }, ["The Five Sections"]), Tela.element('div', { 'class': "tela-ComponentAnatomy-div-8" }, [Tela.element('div', { 'class': "tela-ComponentAnatomy-div-9" }, [Tela.element('div', { 'class': "tela-ComponentAnatomy-div-10" }, ["1. state"]), Tela.element('div', { 'class': "tela-ComponentAnatomy-div-11" }, ["Reactive data local to the component. Any state change triggers a targeted DOM update."])]), Tela.element('div', { 'class': "tela-ComponentAnatomy-div-12" }, [Tela.element('div', { 'class': "tela-ComponentAnatomy-div-13" }, ["2. prop"]), Tela.element('div', { 'class': "tela-ComponentAnatomy-div-14" }, ["Values passed in from a parent component. Props are read-only inside the component."])]), Tela.element('div', { 'class': "tela-ComponentAnatomy-div-15" }, [Tela.element('div', { 'class': "tela-ComponentAnatomy-div-16" }, ["3. function"]), Tela.element('div', { 'class': "tela-ComponentAnatomy-div-17" }, ["Logic blocks that can read and update state, call fetch, or emit events. Use async for async operations."])]), Tela.element('div', { 'class': "tela-ComponentAnatomy-div-18" }, [Tela.element('div', { 'class': "tela-ComponentAnatomy-div-19" }, ["4. onMount / onUpdate / onDestroy"]), Tela.element('div', { 'class': "tela-ComponentAnatomy-div-20" }, ["Lifecycle hooks that run at specific points in the component lifespan."])]), Tela.element('div', { 'class': "tela-ComponentAnatomy-div-21" }, [Tela.element('div', { 'class': "tela-ComponentAnatomy-div-22" }, ["5. view"]), Tela.element('div', { 'class': "tela-ComponentAnatomy-div-23" }, ["The declarative template that describes the DOM. Uses interpolation, control flow, and child components."])])])]);
    };
  }
});

(function(){
  if (typeof window !== 'undefined') {
    window.ComponentAnatomy = ComponentAnatomy;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ComponentAnatomy };
  }
})();