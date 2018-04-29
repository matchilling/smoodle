defmodule Smoodle.Scheduler do
  @moduledoc """
  The Scheduler context.
  """

  import Ecto.Query, warn: false
  alias Smoodle.Repo

  alias Smoodle.Scheduler.Event

  @doc """
  Returns the list of events.

  ## Examples

      iex> list_events()
      [%Event{}, ...]

  """
  def list_events do
    Repo.all(Event)
  end

  @doc """
  Gets a single event.

  Raises if the Event does not exist.

  ## Examples

      iex> get_event!(123)
      %Event{}

  """
  def get_event!(id) do
    Repo.get!(Event, id)
  end


  @doc """
  Gets a single event for an update, requires knowing the update token

  Raises if the Event does not exist or the token is wrong
  """
  def get_event_for_update!(id, update_token) do
    Repo.get_by!(Event, id: id, update_token: update_token)
  end


  @doc """
  Creates a event.

  ## Examples

      iex> create_event(%{field: value})
      {:ok, %Event{}}

      iex> create_event(%{field: bad_value})
      {:error, ...}

  """
  def create_event(attrs, opts \\ [])

  def create_event(attrs, validate: true) do
    Event.changeset_insert(attrs)
  end

  def create_event(attrs, _) do
    Event.changeset_insert(attrs)
    |> Repo.insert
  end


  @doc """
  Updates a event.

  ## Examples

      iex> update_event(event, %{field: new_value})
      {:ok, %Event{}}

      iex> update_event(event, %{field: bad_value})
      {:error, ...}

  """
  def update_event(%Event{} = event, attrs) do
    event
    |> Event.changeset(attrs)
    |> Repo.update
  end

  @doc """
  Deletes a Event.

  ## Examples

      iex> delete_event(event)
      {:ok, %Event{}}

      iex> delete_event(event)
      {:error, ...}

  """
  def delete_event(%Event{} = event) do
    Repo.delete(event)
  end
end
