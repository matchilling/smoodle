defmodule SmoodleWeb.Router do
  use SmoodleWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", SmoodleWeb do
    pipe_through :browser # Use the default browser stack

    get "/", PageController, :index
  end

  scope "/v1", SmoodleWeb do
    pipe_through :api

    resources "/events", EventController, except: [:new, :delete]
  end

  # Other scopes may use custom stacks.
  # scope "/api", SmoodleWeb do
  #   pipe_through :api
  # end
end
