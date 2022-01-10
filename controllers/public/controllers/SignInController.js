module.exports = async function (cuderi, opts) {
  opts.schema = {
    body: {
      required: ["usuario", "clave"],
      type: "object",
      properties: {
        usuario: { type: "string" },
        clave: { type: "string" },
      },
    },
  };
  cuderi.post("/signin", opts, async (req, reply) => {
    const { usuario, clave } = req.body;
    const auth = cuderi.getService('AuthService')
    const result = auth.login({ usuario, clave })
    return result
  });
};