
const SpringBoot = Tela.defineComponent({
  name: 'SpringBoot',
  
  
  setup(instance) {
    const state_SpringBoot = Tela.reactive({
      mavenCode: "",
      springHtmlCode: ""
    }, instance.update, {});

    

    

    const navigate = (dest) => {
      window.history.pushState(null, '', dest);
      window.dispatchEvent(new PopStateEvent('popstate'));
    };

    

    

    

    // onMount
    state_SpringBoot.mavenCode = window.TELA_DOCS.mavenCode;
      state_SpringBoot.springHtmlCode = window.TELA_DOCS.springHtmlCode;

    return () => {
      
      return Tela.element('div', {  }, [Tela.element('h1', { 'class': "tela-SpringBoot-h1-0" }, ["Spring Boot Integration"]), Tela.element('div', { 'class': "tela-SpringBoot-div-1" }, [""]), Tela.element('p', { 'class': "tela-SpringBoot-p-2" }, ["Tela pairs naturally with Spring Boot. Place your .tela files in src/main/resources/static/components and compile them as part of your Maven build."]), Tela.element('h2', { 'class': "tela-SpringBoot-h2-3" }, ["Maven Plugin Configuration"]), Tela.element('p', { 'class': "tela-SpringBoot-p-4" }, ["Add the exec-maven-plugin to your pom.xml to compile Tela files during the generate-resources phase:"]), Tela.element('div', { 'class': "tela-SpringBoot-div-5" }, [Tela.element('pre', { 'class': "tela-SpringBoot-pre-6" }, [Tela.element('code', { 'class': "language-xml" }, [`${state_SpringBoot.mavenCode}`])])]), Tela.element('h2', { 'class': "tela-SpringBoot-h2-7" }, ["HTML Template"]), Tela.element('p', { 'class': "tela-SpringBoot-p-8" }, ["In your Thymeleaf or plain HTML template, load the compiled assets and mount the app:"]), Tela.element('div', { 'class': "tela-SpringBoot-div-9" }, [Tela.element('pre', { 'class': "tela-SpringBoot-pre-10" }, [Tela.element('code', { 'class': "language-html" }, [`${state_SpringBoot.springHtmlCode}`])])]), Tela.element('h2', { 'class': "tela-SpringBoot-h2-11" }, ["Controller Pattern"]), Tela.element('p', { 'class': "tela-SpringBoot-p-12" }, ["Your Spring Boot controllers expose REST endpoints as usual. Tela components fetch data from these endpoints using the browser fetch API. No special server-side integration is required — Tela is purely a frontend concern."]), Tela.element('div', { 'class': "tela-SpringBoot-div-13" }, [Tela.element('p', { 'class': "tela-SpringBoot-p-14" }, ["The PetClinic example in this repository shows a complete Spring Boot and Tela integration with Owners, Pets, Vets, and Visits managed through a REST API."])])]);
    };
  }
});

(function(){
  if (typeof window !== 'undefined') {
    window.SpringBoot = SpringBoot;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SpringBoot };
  }
})();