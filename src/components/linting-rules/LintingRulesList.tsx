import React, {useEffect, useState} from 'react';
import {
  Button,
  Card,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography
} from "@mui/material";
import {useGetLintingRules, useModifyLintingRules} from "../../utils/queries.tsx";
import {queryClient} from "../../App.tsx";
import {Rule} from "../../types/Rule.ts";

const LintingRulesList = () => {
  const [rules, setRules] = useState<Rule[] | undefined>([]);

  const {data, isLoading} = useGetLintingRules();
  const {mutateAsync, isLoading: isLoadingMutate} = useModifyLintingRules({
    onSuccess: () => queryClient.invalidateQueries('lintingRules')
  })

  useEffect(() => {
    setRules(data)
  }, [data]);

  const handleValueChange = (rule: Rule, newValue: string | number) => {
    const newRules = rules?.map(r => {
      if (r.id === rule.id && r.name === rule.name) {
        return {...r, value: newValue}
      } else {
        return r;
      }
    })
    setRules(newRules)
  };

  const handleNumberChange = (rule: Rule) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    handleValueChange(rule, isNaN(value) ? 0 : value);
  };

  const toggleRule = (rule: Rule) => () => {
    const newRules = rules?.map(r => {
      if (r.id === rule.id && r.name === rule.name) {
        return {...r, isActive: !r.isActive}
      } else {
        return r;
      }
    })
    setRules(newRules)
  }

  const isIdentifierStyleRule = (ruleName: string) => {
    return ruleName.toLowerCase().includes('identifier') || ruleName.toLowerCase().includes('style');
  };

  return (
      <Card style={{padding: 16, margin: 16}}>
        <Typography variant={"h6"}>Linting rules</Typography>
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {
            isLoading || isLoadingMutate ?  <Typography style={{height: 80}}>Loading...</Typography> :
                rules?.map((rule, index) => {
                  return (
                      <ListItem
                          key={rule.id ?? `rule-${index}`}
                          disablePadding
                          style={{height: 40}}
                      >
                        <Checkbox
                            edge="start"
                            checked={rule.isActive}
                            disableRipple
                            onChange={toggleRule(rule)}
                        />
                        <ListItemText primary={rule.name} />
                        {typeof rule.value === 'number' ?
                            (<TextField
                                type="number"
                                variant={"standard"}
                                value={rule.value}
                                onChange={handleNumberChange(rule)}
                            />) : typeof rule.value === 'string' && isIdentifierStyleRule(rule.name) ?
                                (<Select
                                    variant="standard"
                                    value={rule.value}
                                    onChange={e => handleValueChange(rule, e.target.value)}
                                    sx={{ minWidth: 120 }}
                                >
                                  <MenuItem value="NO_STYLE">No style</MenuItem>
                                  <MenuItem value="SNAKE_CASE">Snake case</MenuItem>
                                  <MenuItem value="CAMEL_CASE">Camel case</MenuItem>
                                </Select>) : typeof rule.value === 'string' ?
                                    (<TextField
                                        variant={"standard"}
                                        value={rule.value}
                                        onChange={e => handleValueChange(rule, e.target.value)}
                                    />) : null
                        }
                      </ListItem>
                  )
                })}
        </List>
        <Button disabled={isLoading} variant={"contained"} onClick={() => mutateAsync(rules ?? [])}>Save</Button>
      </Card>

  );
};

export default LintingRulesList;