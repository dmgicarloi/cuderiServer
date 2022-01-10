module.exports = {
  routePrefix: '/documentation',
  swagger: {
    info: {
      title: 'Api',
      description: 'Sistema Erp',
      version: '0.1.0'
    },
    externalDocs: {
      url: 'https://swagger.io',
      description: 'Find more info here'
    },
    host: 'localhost:3000',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    securityDefinitions : {
      Authorization : {
        type: 'apiKey',
        in: 'header',
        name: 'Authorization',
        template: "Bearer {apiKey}"
      }
    }
  },
  uiConfig: {
    docExpansion: 'full',
    deepLinking: true
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
  exposeRoute: true
}