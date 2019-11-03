import { UserNameWasUpdated, UserWasRegistered } from '../../test/model/user';
import { createEventStore } from '../index';
import { InMemoryEventStore } from '../in-memory';
import { AbstractProjection, IProjectionConstructor } from '../projection';
import { Driver } from '../types';
import { Projection } from './projection';

@Projection('user_list')
class UserListProjection extends AbstractProjection<{
  [userId: string]: { username: string; id: string; password: string };
}> {
  public project() {
    return this.projector
      .fromStream({ streamName: 'users' })
      .init(() => ({}))
      .when({
        [UserWasRegistered.name]: (state, event: UserWasRegistered) => {
          state[event.userId] = {
            id: event.userId,
            username: event.username,
            password: event.password,
          };

          return state;
        },
        [UserNameWasUpdated.name]: (state, event: UserNameWasUpdated) => {
          state[event.userId].username = event.username;

          return state;
        },
      });
  }
}

describe('decorator/projection', () => {
  it('finds decorated projections and add the defined name to the constructor', done => {
    const eventStore = createEventStore({
      driver: Driver.IN_MEMORY,
      connectionString: '',
    }) as InMemoryEventStore;

    const projector = eventStore.getProjector<UserListProjection>('user_list');

    expect(projector).not.toBeNull();
    expect((projector.constructor as IProjectionConstructor).name).toEqual('InMemoryProjector');

    done();
  });
});