import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Country } from './country.entity';

@Entity()
export class CountryRss {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  feedUrl: string;

  @Column()
  domain: string;

  @ManyToOne(() => Country, country => country.rssFeeds)
  country: Country;
} 