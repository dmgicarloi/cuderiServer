module.exports = async function (_this, opts) {
  _this.models.DemoModel = class {
      constructor() {
          this.name = 'demo'
          const { knex } = _this
          this.knex = knex
      }
  }
}