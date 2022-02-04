module.exports = async function (_this, opts) {
  _this.models.DemoService = class {
      constructor() {
          this.name = 'demo'
          const { knex } = _this
          this.knex = knex
      }
  }
}