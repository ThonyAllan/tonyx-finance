export class Router {
  #routes = new Map();
  #current = null;

  register(path, mountFn) {
    this.#routes.set(path, mountFn);
    return this;
  }

  start() {
    window.addEventListener('hashchange', () => this.#route());
    this.#route();
  }

  navigate(path) {
    window.location.hash = path;
  }

  #route() {
    const hash = window.location.hash || '#/dashboard';
    const path = hash.replace(/^#/, '');
    const mount = this.#routes.get(path);
    if (mount && path !== this.#current) {
      this.#current = path;
      mount();
    } else if (!mount) {
      this.navigate('/dashboard');
    }
  }

  get currentPath() { return this.#current; }
}

export const router = new Router();
