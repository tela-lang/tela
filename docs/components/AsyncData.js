
const AsyncData = Tela.defineComponent({
  name: 'AsyncData',
  
  
  setup(instance) {
    const state_AsyncData = Tela.reactive({
      asyncCode: ""
    }, instance.update, {});

    

    

    

    

    // onMount
    state_AsyncData.asyncCode = window.TELA_DOCS.asyncCode;

    return () => {
      
      return Tela.element('div', {  }, [Tela.element('h1', { 'class': "tela-AsyncData-h1-0" }, ["Async and Data Fetching"]), Tela.element('div', { 'class': "tela-AsyncData-div-1" }, [""]), Tela.element('p', { 'class': "tela-AsyncData-p-2" }, ["Tela supports async functions with the await keyword. Use them to fetch data from APIs and update state when the response arrives."]), Tela.element('h2', { 'class': "tela-AsyncData-h2-3" }, ["Full CRUD Example"]), Tela.element('p', { 'class': "tela-AsyncData-p-4" }, ["A complete component with load, create, and delete operations:"]), Tela.element('div', { 'class': "tela-AsyncData-div-5" }, [Tela.element('pre', { 'class': "tela-AsyncData-pre-6" }, [Tela.element('code', { 'class': "language-tela" }, [`${state_AsyncData.asyncCode}`])])]), Tela.element('h2', { 'class': "tela-AsyncData-h2-7" }, ["Best Practices"]), Tela.element('div', { 'class': "tela-AsyncData-div-8" }, [Tela.element('div', { 'class': "tela-AsyncData-div-9" }, [Tela.element('div', { 'class': "tela-AsyncData-div-10" }, ["Always set a loading flag"]), Tela.element('div', { 'class': "tela-AsyncData-div-11" }, ["Set loading = true before the request and loading = false after. Use if (loading) in the view to show a spinner."])]), Tela.element('div', { 'class': "tela-AsyncData-div-12" }, [Tela.element('div', { 'class': "tela-AsyncData-div-13" }, ["Use immutable array updates"]), Tela.element('div', { 'class': "tela-AsyncData-div-14" }, ["Use concat, filter, and map to produce new arrays rather than mutating in place. Tela detects changes by reference."])]), Tela.element('div', { 'class': "tela-AsyncData-div-15" }, [Tela.element('div', { 'class': "tela-AsyncData-div-16" }, ["Kick off fetches in onMount"]), Tela.element('div', { 'class': "tela-AsyncData-div-17" }, ["Call your async function from the onMount lifecycle hook so the data loads as soon as the component appears."])])])]);
    };
  }
});

(function(){
  if (typeof window !== 'undefined') {
    window.AsyncData = AsyncData;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AsyncData };
  }
})();