import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CountryRss } from './country-rss.entity';

@Entity()
export class Country {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  code: string;

  @OneToMany(() => CountryRss, countryRss => countryRss.country)
  rssFeeds: CountryRss[];
} 