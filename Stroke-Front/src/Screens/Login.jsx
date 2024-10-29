import { Link } from "react-router-dom";

const Login = () => {
  return (
    <section className="gradient-form d-flex justify-content-center align-items-center vh-100">
      <div className="container py-5">
        <div className="row justify-content-center align-items-center">
          <div className="col-lg-10 col-md-8 col-sm-12">
            <div className="card rounded-3 shadow-lg text-black animate__animated animate__fadeIn">
              <div className="row g-0">
                <div className="col-lg-6 animate__animated animate__fadeInLeft">
                  <div className="card-body p-md-5 mx-md-4">
                    <div className="text-center">
                      <img
                        src="/Stroke.png"
                        style={{ width: '120px' }}
                        alt="logo"
                        className="mb-4"
                      />
                      <h4 className="mt-1 mb-5 pb-1">Bienvenido a Stroke</h4>
                    </div>

                    <form>
                      <p className="text-muted">Ingresa los datos de tu cuenta</p>

                      <div className="form-outline mb-4">
                        <input
                          type="email"
                          id="form2Example11"
                          className="form-control form-control-lg"
                          placeholder="Correo electronico"
                        />
                        <label className="form-label" htmlFor="form2Example11">
                          Correo electronico
                        </label>
                      </div>

                      <div className="form-outline mb-4">
                        <input
                          type="password"
                          id="form2Example22"
                          className="form-control form-control-lg"
                          placeholder="Contraseña"
                        />
                        <label className="form-label" htmlFor="form2Example22">
                          Contraseña
                        </label>
                      </div>

                      <div className="text-center pt-1 mb-5 pb-1">
                        <Link to="/home">
                        <button
                          className="btn btn-primary btn-lg btn-block gradient-custom-2"
                          type="button"
                        >
                          Entrar
                        </button>
                        </Link>
                        <a className="text-muted d-block mt-3" href="#!">
                          ¿Olvidaste tu contraseña?
                        </a>
                      </div>

                      <div className="d-flex align-items-center justify-content-center pb-4">
                        <p className="mb-0 me-2">¿No tienes una cuenta?</p>
                        <Link to="/registro">
                        <button type="button" className="btn btn-outline-danger">
                          Regístrate
                        </button>
                        </Link>
                      </div>
                    </form>
                  </div>
                </div>

                <div className="col-lg-6 d-none d-lg-flex align-items-center gradient-custom-2 animate__animated animate__fadeInRight">
                  <div className="text-white px-3 py-4 p-md-5 mx-md-4 d-flex justify-content-center">
                    <img
                      src="https://images.pexels.com/photos/4240497/pexels-photo-4240497.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                      alt="Imagen de inicio"
                      className="img-fluid"
                      style={{ maxWidth: '100%', borderRadius: '10px' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
