import gym
from gym import spaces
import numpy as np
from tqdm import tqdm

class FactoryGame:
    def __init__(self):
        self.reset()
        
    def reset(self):
        self.steel = 1000.0
        self.crystals = 1000.0
        self.steel_factories = 1
        self.crystal_factories = 1
        self.electricity_factories = 1
        self.time_elapsed = 0.0
        self.update_production()
        return self.get_state()

    def update_production(self):
        # Production rates
        self.steel_prod = self.steel_factories * 5
        self.crystal_prod = self.crystal_factories * 3
        self.electricity_prod = self.electricity_factories * 20
        
        # Consumption
        self.electricity_cons = (self.steel_factories * 10 + 
                                self.crystal_factories * 15)

    def get_state(self):
        return np.array([
            self.steel,
            self.crystals,
            self.steel_factories,
            self.crystal_factories,
            self.electricity_factories,
            self.time_elapsed
        ])

    def get_cost(self, factory_type):
        levels = {
            'steel': self.steel_factories,
            'crystal': self.crystal_factories,
            'electricity': self.electricity_factories
        }
        next_level = levels[factory_type] + 1
        costs = {
            'steel': (100 * (2 ** (next_level - 1)), 
                      50 * (2 ** (next_level - 1))),
            'crystal': (150 * (2 ** (next_level - 1)), 
                        75 * (2 ** (next_level - 1))),
            'electricity': (200 * (2 ** (next_level - 1)), 
                            100 * (2 ** (next_level - 1)))
        }
        return costs[factory_type]

    def can_buy(self, factory_type):
        steel_cost, crystal_cost = self.get_cost(factory_type)
        
        if factory_type == 'electricity':
            return (self.steel >= steel_cost and 
                    self.crystals >= crystal_cost)
        
        # Check resource requirements
        if self.steel < steel_cost or self.crystals < crystal_cost:
            return False
        
        # Check electricity requirements
        new_cons = self.electricity_cons
        if factory_type == 'steel':
            new_cons += 10
        elif factory_type == 'crystal':
            new_cons += 15
            
        return new_cons <= self.electricity_prod

    def buy_factory(self, factory_type):
        if not self.can_buy(factory_type):
            return False
            
        steel_cost, crystal_cost = self.get_cost(factory_type)
        self.steel -= steel_cost
        self.crystals -= crystal_cost
        
        if factory_type == 'steel':
            self.steel_factories += 1
        elif factory_type == 'crystal':
            self.crystal_factories += 1
        else:
            self.electricity_factories += 1
            
        self.update_production()
        return True

    def simulate_time(self, delta_time):
        self.steel += self.steel_prod * delta_time
        self.crystals += self.crystal_prod * delta_time
        self.time_elapsed += delta_time

    def get_net_worth(self):
        factory_value = sum(
            100*(2**(i-1)) + 50*(2**(i-1)) for i in range(1, self.steel_factories+1)
        ) + sum(
            150*(2**(i-1)) + 75*(2**(i-1)) for i in range(1, self.crystal_factories+1)
        ) + sum(
            200*(2**(i-1)) + 100*(2**(i-1)) for i in range(1, self.electricity_factories+1)
        )
        return self.steel + self.crystals + factory_value

class FactoryEnv(gym.Env):
    def __init__(self, max_time=300):
        super(FactoryEnv, self).__init__()
        self.game = FactoryGame()
        self.max_time = max_time
        
        self.action_space = spaces.Discrete(4)  # 0: steel, 1: crystal, 2: electricity, 3: wait
        self.observation_space = spaces.Box(
            low=0, 
            high=np.inf, 
            shape=(6,),  # steel, crystals, factories, time
            dtype=np.float32
        )
        
        self.last_net_worth = 0

    def reset(self):
        self.last_net_worth = 0
        state = self.game.reset()
        return state

    def step(self, action):
        factory_types = ['steel', 'crystal', 'electricity', None]
        target = factory_types[action]
        
        if target is None:
            # Wait until end
            delta_time = self.max_time - self.game.time_elapsed
            self.game.simulate_time(delta_time)
        else:
            # Calculate time needed to buy
            steel_cost, crystal_cost = self.game.get_cost(target)
            
            req_steel = max(0, steel_cost - self.game.steel)
            req_crystal = max(0, crystal_cost - self.game.crystals)
            
            time_steel = req_steel / self.game.steel_prod if self.game.steel_prod > 0 else np.inf
            time_crystal = req_crystal / self.game.crystal_prod if self.game.crystal_prod > 0 else np.inf
            delta_time = max(time_steel, time_crystal)
            
            # Cap to remaining time
            remaining_time = self.max_time - self.game.time_elapsed
            delta_time = min(delta_time, remaining_time)
            
            if delta_time > 0:
                self.game.simulate_time(delta_time)
            
            # Try to buy after waiting
            success = self.game.buy_factory(target)
        
        # Calculate reward
        new_net_worth = self.game.get_net_worth()
        reward = new_net_worth - self.last_net_worth
        self.last_net_worth = new_net_worth
        
        done = self.game.time_elapsed >= self.max_time
        info = {}
        
        return self.game.get_state(), reward, done, info

    def render(self, mode='human'):
        print(f"Time: {self.game.time_elapsed:.1f}s")
        print(f"Steel: {self.game.steel:.1f} (prod: {self.game.steel_prod}/s)")
        print(f"Crystals: {self.game.crystals:.1f} (prod: {self.game.crystal_prod}/s)")
        print(f"Factories: S={self.game.steel_factories}, C={self.game.crystal_factories}, E={self.game.electricity_factories}")
        print(f"Electricity: {self.game.electricity_cons}/{self.game.electricity_prod}")
        print("---------------")

# Example usage with Stable Baselines3
from stable_baselines3 import PPO
from stable_baselines3.common.env_util import make_vec_env

# Create environment
env = FactoryEnv(max_time=3600)

# Create model
model = PPO("MlpPolicy", env, verbose=1)

# Train the model
model.learn(total_timesteps=10**6)

# Test the trained model
obs = env.reset()
total_reward = 0
for _ in tqdm(range(1000)):
    action, _states = model.predict(obs)
    print(f"Action: {action}")
    obs, reward, done, info = env.step(action)
    total_reward += reward
    env.render()
    if done:
        break
print(f"Total reward: {total_reward}")