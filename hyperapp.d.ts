export as namespace hyperapp

/** @namespace [App] */

/** The result of an action.
 *
 * @memberOf [App]
 */
export type ActionResult<State> = Partial<State> | Promise<any> | null | void

/** The interface for a single action implementation.
 *
 * @memberOf [App]
 */
export type ActionType<State, Actions> = (
  data?: any
) =>
  | ((state: State, actions: Actions) => ActionResult<State>)
  | ActionResult<State>

/** The interface for the actions tree implementation.
 *
 * @memberOf [App]
 */
export type ActionsType<State, Actions> = {
  [P in keyof Actions]:
    | ActionType<State, Actions>
    | ActionsType<any, Actions[P]>
}

/** A consumer function which can act on changes to the state.
 *
 * @memberOf [App]
 */
export interface OnUpdate<State, Actions> {
  (state: State, actions: Actions): any
}

/** The app() call creates and renders a new application.
 *
 * @param state The state object.
 * @param actions The actions object implementation.
 * @param view The view function.
 * @param container The DOM element where the app will be rendered to.
 * @returns The actions wired to the application.
 * @memberOf [App]
 */
export function app<State, Actions>(
  state: State,
  actions: ActionsType<State, Actions>,
  onUpdate: OnUpdate<State, Actions>
): Actions
