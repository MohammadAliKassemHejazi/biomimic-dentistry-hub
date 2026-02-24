import { Request, Response } from 'express';
import { SubscriptionPlan } from '../models';

export const getPlans = async (req: Request, res: Response) => {
  try {
    const plans = await SubscriptionPlan.findAll({ order: [['price', 'ASC']] });
    res.json(plans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ message: 'Error fetching plans' });
  }
};

export const updatePlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, features, popular, interval, price, key, stripePriceId } = req.body;

    const [updated] = await SubscriptionPlan.update({
        name, features, popular, interval, price, key, stripePriceId
    }, { where: { id } });

    if (updated) {
      const updatedPlan = await SubscriptionPlan.findByPk(id as string);
      res.json(updatedPlan);
    } else {
      res.status(404).json({ message: 'Plan not found' });
    }
  } catch (error) {
    console.error('Error updating plan:', error);
    res.status(500).json({ message: 'Error updating plan' });
  }
};

export const seedPlans = async (req: Request, res: Response) => {
     try {
        const count = await SubscriptionPlan.count();
        if (count > 0) {
            const plans = await SubscriptionPlan.findAll({ order: [['price', 'ASC']] });
            return res.json({ message: 'Plans already exist', plans });
        }

        const plansData = [
          {
            key: 'basic',
            name: 'Basic',
            price: 29,
            interval: 'month',
            stripePriceId: 'price_1S7EbEAI5O329ebg7Hqc1N1P',
            features: [
              'Access to basic courses',
              'Community forum access',
              'Monthly newsletter',
              'Basic resources library'
            ],
            popular: false
          },
          {
            key: 'vip',
            name: 'VIP',
            price: 99,
            interval: 'month',
            stripePriceId: 'price_1S7EbnAI5O329ebgzZ5CxmIj',
            features: [
              'All Basic features',
              'VIP exclusive content',
              'Live Q&A sessions',
              'Advanced resources',
              'Priority support',
              'Certification courses'
            ],
            popular: true
          },
          {
            key: 'ambassador',
            name: 'Ambassador',
            price: 199,
            interval: 'month',
            stripePriceId: 'price_1S7Ec2AI5O329ebgXUxKBPK7',
            features: [
              'All VIP features',
              'Ambassador network access',
              'Mentorship programs',
              'Research collaborations',
              'Speaking opportunities',
              'Revenue sharing'
            ],
            popular: false
          }
        ];

        const createdPlans = await SubscriptionPlan.bulkCreate(plansData);
        res.status(201).json({ message: 'Plans seeded', plans: createdPlans });
     } catch (error) {
        console.error('Error seeding plans:', error);
        res.status(500).json({ message: 'Error seeding plans' });
     }
}
