
const EnumsModels = Tela.defineComponent({
  name: 'EnumsModels',
  
  
  setup(instance) {
    const state_EnumsModels = Tela.reactive({
      enumCode: "",
      modelCode: ""
    }, instance.update, {});

    

    

    

    // onMount
    state_EnumsModels.enumCode = window.TELA_DOCS.enumCode;
      state_EnumsModels.modelCode = window.TELA_DOCS.modelCode;

    return () => {
      
      return Tela.element('div', {  }, [Tela.element('h1', { 'class': "tela-EnumsModels-h1-0" }, ["Enums and Models"]), Tela.element('div', { 'class': "tela-EnumsModels-div-1" }, [""]), Tela.element('p', { 'class': "tela-EnumsModels-p-2" }, ["enum and model are top-level declarations that sit above the component. They let you define named constants and typed data shapes that are shared across your component logic and view."]), Tela.element('h2', { 'class': "tela-EnumsModels-h2-3" }, ["enum"]), Tela.element('p', { 'class': "tela-EnumsModels-p-4" }, ["An enum compiles to a frozen JavaScript object. Use it to avoid magic strings and get auto-complete-friendly constant names."]), Tela.element('div', { 'class': "tela-EnumsModels-div-5" }, [Tela.element('pre', { 'class': "tela-EnumsModels-pre-6" }, [Tela.element('code', { 'class': "language-tela" }, [`${state_EnumsModels.enumCode}`])])]), Tela.element('div', { 'class': "tela-EnumsModels-div-7" }, ["Compiled output: const Status = Object.freeze({ DRAFT: 'DRAFT', PUBLISHED: 'PUBLISHED', ARCHIVED: 'ARCHIVED' })"]), Tela.element('h2', { 'class': "tela-EnumsModels-h2-8" }, ["model"]), Tela.element('p', { 'class': "tela-EnumsModels-p-9" }, ["A model compiles to a factory function. Call it with a plain object to produce a typed record. Use it when creating new objects to pass to an API."]), Tela.element('div', { 'class': "tela-EnumsModels-div-10" }, [Tela.element('pre', { 'class': "tela-EnumsModels-pre-11" }, [Tela.element('code', { 'class': "language-tela" }, [`${state_EnumsModels.modelCode}`])])]), Tela.element('div', { 'class': "tela-EnumsModels-div-12" }, ["Compiled output: const User = (data) => ({ firstName: data.firstName, lastName: data.lastName, email: data.email, role: data.role })"]), Tela.element('h2', { 'class': "tela-EnumsModels-h2-13" }, ["When to use each"]), Tela.element('div', { 'class': "tela-EnumsModels-div-14" }, [Tela.element('div', { 'class': "tela-EnumsModels-div-15" }, [Tela.element('div', { 'class': "tela-EnumsModels-div-16" }, ["Use enum for fixed sets of values"]), Tela.element('div', { 'class': "tela-EnumsModels-div-17" }, ["Status codes, pet types, roles, directions — anything that has a finite set of valid values."])]), Tela.element('div', { 'class': "tela-EnumsModels-div-18" }, [Tela.element('div', { 'class': "tela-EnumsModels-div-19" }, ["Use model for data shapes"]), Tela.element('div', { 'class': "tela-EnumsModels-div-20" }, ["API request bodies, form data, entities — anything you create and pass to fetch. Models document the expected fields and make constructing objects explicit."])])])]);
    };
  }
});

(function(){
  if (typeof window !== 'undefined') {
    window.EnumsModels = EnumsModels;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EnumsModels };
  }
})();